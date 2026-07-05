#!/usr/bin/env bash
# pipeline.sh — 日次アフィリエイト記事の「生成 → 品質ゲート → 本番公開(push)」を実行する。
#
# 実行場所: 専用 publish clone のリポジトリルート想定 (automation/ の親)。
# 手動テスト:
#   automation/pipeline.sh --dry-run   # トピック選定だけ見て停止 (claude/pushしない)
#   automation/pipeline.sh --no-push    # 生成・ゲートまで実行、push はしない
#   automation/pipeline.sh              # 本番: 生成 → ゲート → push origin main
#
# 設計方針: git/ファイル操作はすべてこのシェルが決定論的に行う。claude(ヘッドレス)は
#   MDX 生成・R2 画像・採点・manifest 出力までで、commit/push/退避は一切しない。
#
# 互換性: macOS 標準の /bin/bash は 3.2。mapfile 不在・set -u × 空配列クラッシュを避けるため
#   set -u / set -e は使わず (pipefail のみ)。エラーは明示チェック + notify で扱う。
set -o pipefail

# ---------- フラグ ----------
DRY_RUN=0; NO_PUSH=0
for a in "$@"; do
  case "$a" in
    --dry-run) DRY_RUN=1 ;;
    --no-push) NO_PUSH=1 ;;
    *) echo "unknown flag: $a" >&2; exit 2 ;;
  esac
done

# ---------- 位置・環境 ----------
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$REPO"
[ -f "$SCRIPT_DIR/env.sh" ] && . "$SCRIPT_DIR/env.sh"

export SMILE_COMFORT_REPO="$REPO"
ARTICLES_PER_DAY="${ARTICLES_PER_DAY:-3}"
PUBLISH_MIN_SCORE="${PUBLISH_MIN_SCORE:-90}"
CLAUDE_MODEL="${CLAUDE_MODEL:-opus}"
CLAUDE_TIMEOUT="${CLAUDE_TIMEOUT:-14400}"  # 秒(4h)。claude ヘッドレスの上限
STEP_TIMEOUT="${STEP_TIMEOUT:-2400}"       # 秒(40m)。npm ci / validate / build 各ステップの上限
BRANCH="${PUBLISH_BRANCH:-main}"

DATE=$(date +%Y-%m-%d)
TS=$(date +%Y%m%d-%H%M%S)
RUNDIR="$SCRIPT_DIR/runs/$DATE"
LOGDIR="$SCRIPT_DIR/logs"
HOLDING="$SCRIPT_DIR/holding"
STATEDIR="$SCRIPT_DIR/state"
LEDGER="$STATEDIR/ledger.tsv"
INBOX="$SCRIPT_DIR/INBOX.md"
LOG="$LOGDIR/$DATE.log"
LOCK="$STATEDIR/run.lock"
PICKED_TSV="$RUNDIR/picked.tsv"
MANIFEST="$RUNDIR/manifest.json"
mkdir -p "$RUNDIR" "$LOGDIR" "$HOLDING" "$STATEDIR"

# ---------- ログ (tee) ----------
exec > >(tee -a "$LOG") 2>&1
echo "==== daily run $TS  (branch=$BRANCH min_score=$PUBLISH_MIN_SCORE n=$ARTICLES_PER_DAY dry=$DRY_RUN no_push=$NO_PUSH) ===="

# ---------- 通知 ----------
notify() { # title, message
  local title="$1" msg="$2"
  # osascript は " と改行で壊れる/注入されるため無害化してから渡す
  local safe_t safe_m
  safe_t=$(printf '%s' "$title" | tr '\n"' '  ')
  safe_m=$(printf '%s' "$msg"   | tr '\n"' '  ')
  /usr/bin/osascript -e "display notification \"$safe_m\" with title \"$safe_t\"" >/dev/null 2>&1 || true
  printf -- "- [%s] **%s** — %s\n" "$TS" "$safe_t" "$safe_m" >> "$INBOX"
}
fail() { notify "日次記事: 失敗" "$1"; echo "FATAL: $1"; exit 1; }

# ---------- タイムアウト付き実行 (ログ出力版) ----------
# setpgrp で独立プロセスグループにし、タイムアウト時は子孫(npm→next build→node)ごと group kill する。
run_to_log() { # secs, logfile, cmd...
  local secs="$1" logf="$2"; shift 2
  perl -e 'setpgrp(0,0); exec @ARGV or die $!' "$@" > "$logf" 2>&1 &
  local pid=$!
  ( sleep "$secs"; if kill -0 "$pid" 2>/dev/null; then echo "TIMEOUT(${secs}s): $* をグループ停止" >> "$logf"; kill -TERM -"$pid" 2>/dev/null; sleep 5; kill -KILL -"$pid" 2>/dev/null; fi ) &
  local wpid=$!
  wait "$pid"; local rc=$?
  kill "$wpid" 2>/dev/null || true
  return $rc
}

# ---------- ロック (mkdir はアトミック。pid同一性 + 経過時間で stale 判定) ----------
LOCK_MAX_AGE=$(( CLAUDE_TIMEOUT + 3600 ))
if ! mkdir "$LOCK" 2>/dev/null; then
  oldpid=$(cat "$LOCK/pid" 2>/dev/null)
  oldepoch=$(cat "$LOCK/epoch" 2>/dev/null || echo 0)
  now=$(date +%s); age=$(( now - oldepoch )); alive=0
  if [ -n "$oldpid" ] && kill -0 "$oldpid" 2>/dev/null && ps -o command= -p "$oldpid" 2>/dev/null | grep -q "pipeline.sh"; then alive=1; fi
  if [ "$alive" = 1 ] && [ "$age" -lt "$LOCK_MAX_AGE" ]; then
    echo "既に実行中 (pid $oldpid, ${age}s 経過)。今回はスキップ。"
    notify "日次記事: 二重起動を回避" "前回 run (pid $oldpid) が ${age}s 継続中のため今回スキップ。"
    exit 0
  fi
  echo "stale lock を除去 (pid=$oldpid age=${age}s alive=$alive)"
  [ "$alive" = 1 ] && notify "日次記事: 前回ハング疑い" "pid $oldpid が ${age}s 継続。stale とみなし再取得。要確認。"
  rm -rf "$LOCK"; mkdir "$LOCK" || fail "ロック取得失敗"
fi
echo $$ > "$LOCK/pid"; date +%s > "$LOCK/epoch"
trap 'rm -rf "$LOCK"' EXIT

# ---------- preflight ----------
need() { command -v "$1" >/dev/null 2>&1 || fail "必須コマンド '$1' が PATH に無い ($2)"; }
need node "node をインストール / PATH を通す"
need git  "git"
need jq   "jq"
need perl "perl (プロセスグループkill用。macOS 標準)"
if [ "$DRY_RUN" != 1 ]; then
  need claude   "claude CLI (ログイン済み)"
  need wrangler "wrangler (npm i -g wrangler)"
  [ -n "${CLOUDFLARE_API_TOKEN:-}" ] || fail "CLOUDFLARE_API_TOKEN 未設定 (automation/env.sh)"
fi

# ---------- ブランチ同期 (未push commit を破棄しない) ----------
git fetch origin "$BRANCH" 2>&1 | tail -2 || fail "git fetch 失敗 (ネットワーク/認証)"
git checkout "$BRANCH" >/dev/null 2>&1 || fail "checkout $BRANCH 失敗"

# 前回残骸/オペレータが戻した untracked 記事を「無言削除/上書きしない」。
# reset --hard / pull より前に退避する (reset --hard は衝突 untracked を安全チェックせず潰すため)。
STRAY=$(git ls-files --others --exclude-standard src/lib/content)
if [ -n "$STRAY" ]; then
  RDIR="$HOLDING/_reclaimed-$TS"
  echo "$STRAY" | while IFS= read -r uf; do
    [ -z "$uf" ] && continue
    mkdir -p "$RDIR/$(dirname "$uf")"; mv "$uf" "$RDIR/$uf" 2>/dev/null || true
  done
  notify "日次記事: 未コミット記事を退避" "run 開始時に未追跡の記事があり $RDIR へ退避。戻した記事は当日中に commit してください。"
fi

git checkout -- . >/dev/null 2>&1 || true          # tracked の作業変更(build成果物)を破棄
AHEAD=$(git rev-list --count "origin/$BRANCH..HEAD" 2>/dev/null || echo 0)
if git pull --ff-only origin "$BRANCH" >/dev/null 2>&1; then
  :
elif [ "${AHEAD:-0}" -gt 0 ]; then
  # 未push の公開 commit がある → 破棄せず rebase で origin 先端に載せ替える (次の push で送出)
  echo "未push commit ${AHEAD} 件を検出 → rebase で保全"
  git branch "backup/unpushed-$TS" HEAD >/dev/null 2>&1 || true
  if ! git rebase "origin/$BRANCH" >/dev/null 2>&1; then
    git rebase --abort 2>/dev/null || true
    fail "diverged かつ未push commit あり、rebase 不可。backup/unpushed-$TS を作成。手動対応を。"
  fi
else
  echo "WARN: diverged (未push commit無し) → origin/$BRANCH に hard reset"
  git reset --hard "origin/$BRANCH" >/dev/null 2>&1 || fail "reset --hard 失敗"
fi

# ---------- 依存 ----------
if [ ! -d node_modules ]; then
  echo "node_modules 無し → npm ci"
  run_to_log "$STEP_TIMEOUT" "$RUNDIR/npmci.log" npm ci || { tail -20 "$RUNDIR/npmci.log"; fail "npm ci 失敗/タイムアウト"; }
fi

# ---------- トピック選定 ----------
BATCH_INPUT="$RUNDIR/batch-input.txt"
node automation/pick-topics.mjs --count "$ARTICLES_PER_DAY" --out "$PICKED_TSV" > "$BATCH_INPUT" 2> "$RUNDIR/pick.log"
PICK_RC=$?
cat "$RUNDIR/pick.log"
if [ "$PICK_RC" -eq 3 ]; then
  notify "日次記事: バックログ枯渇" "topic-backlog.tsv に pending が無い。補充を。"; exit 0
elif [ "$PICK_RC" -ne 0 ]; then
  fail "トピック選定に失敗 (rc=$PICK_RC)"
fi
N=$(grep -c . "$BATCH_INPUT" 2>/dev/null || echo 0)
[ "$N" -ge 1 ] || { notify "日次記事: 対象なし" "選定 0 件"; exit 0; }
echo "本日の対象 $N 件:"; cat "$BATCH_INPUT"

if [ "$DRY_RUN" = 1 ]; then echo "DRY_RUN: ここで停止"; exit 0; fi

# ---------- 台帳追記ヘルパ (picked を正として全消込。全経路で必ず呼ぶ) ----------
# 引数: <manifest|none> <published_csv> <committed_csv>
write_ledger() {
  node automation/write-ledger.mjs \
    --picked "$PICKED_TSV" --manifest "$1" --ledger "$LEDGER" \
    --date "$DATE" --published "$2" --committed "$3" || echo "WARN: 台帳追記に失敗"
}

# ---------- driver プロンプト生成 (multiline safe) ----------
PROMPT_FILE="$RUNDIR/prompt.md"
rm -f "$MANIFEST"
node -e '
  const fs=require("fs");
  const [tpl,picked,min,repo,manifest,out]=process.argv.slice(1);
  // picked.tsv (product\ttopic\tslug_hint) を <product> <topic>  (slug_hint: X) のブロックにする
  const rows=fs.readFileSync(picked,"utf8").split(/\r?\n/).filter(Boolean).map(l=>l.split("\t"));
  const block=rows.map(([p,t,h])=>`${p} ${t}    (slug_hint: ${h})`).join("\n");
  let s=fs.readFileSync(tpl,"utf8");
  s=s.replace("{{BATCH_INPUT}}", block)
     .split("{{MIN_SCORE}}").join(min)
     .split("{{REPO}}").join(repo)
     .split("{{MANIFEST}}").join(manifest);
  fs.writeFileSync(out,s);
' "$SCRIPT_DIR/daily-driver.md" "$PICKED_TSV" "$PUBLISH_MIN_SCORE" "$REPO" "$MANIFEST" "$PROMPT_FILE" \
  || fail "プロンプト生成失敗"

# ---------- claude ヘッドレス実行 (プロセスグループ watchdog 付き) ----------
echo "== claude 起動 (model=$CLAUDE_MODEL, timeout=${CLAUDE_TIMEOUT}s) =="
# setpgrp で claude を独立プロセスグループにし、タイムアウト時に子孫ごと group kill する
perl -e 'setpgrp(0,0); exec @ARGV or die $!' \
  claude -p \
    --model "$CLAUDE_MODEL" \
    --permission-mode bypassPermissions \
    --dangerously-skip-permissions \
    --add-dir "$REPO" \
    --output-format text \
    < "$PROMPT_FILE" > "$RUNDIR/claude-out.txt" 2> "$RUNDIR/claude-err.txt" &
CPID=$!
( sleep "$CLAUDE_TIMEOUT"
  if kill -0 "$CPID" 2>/dev/null; then
    echo "TIMEOUT: claude をグループ停止 (TERM→KILL)"
    kill -TERM -"$CPID" 2>/dev/null; sleep 20; kill -KILL -"$CPID" 2>/dev/null
  fi ) &
WPID=$!
wait "$CPID"; CLAUDE_RC=$?
kill "$WPID" 2>/dev/null || true
echo "== claude 終了 rc=$CLAUDE_RC =="
tail -20 "$RUNDIR/claude-out.txt" 2>/dev/null || true

# ---------- ゲート: 既存編集(バックリンク等)を巻き戻す ----------
# 新規記事は untracked のため保持される。tracked への副次編集だけ破棄し、
# holding 予定の記事へのリンク切れを未然に防ぐ。
git checkout -- src/lib/content 2>/dev/null || true

# ---------- manifest 無し/不正 = 全 hold ----------
hold_all_new() { # reason
  local reason="$1"
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    local slug loc
    slug=$(basename "$f" .mdx)
    loc=$(echo "$f" | sed -E 's#.*src/lib/content/(ja|en)/.*#\1#')
    mkdir -p "$HOLDING/$slug"
    mv "$f" "$HOLDING/$slug/$loc.mdx" 2>/dev/null || true
  done < <(git ls-files --others --exclude-standard src/lib/content)
  write_ledger none "" ""   # 全 picked を error 記録 (再試行上限に達したら消化)
  notify "日次記事: 全保留" "$reason"
}

if [ ! -f "$MANIFEST" ]; then
  echo "manifest 欠落 → 生成物を全 hold"
  hold_all_new "claude が manifest 未出力 (rc=$CLAUDE_RC)。新規記事を holding に退避。要確認: $LOG"
  exit 1
fi
if ! jq -e '(.articles|type)=="array"' "$MANIFEST" >/dev/null 2>&1; then
  echo "manifest 不正(articles が配列でない) → 全 hold"
  hold_all_new "manifest JSON 不正。$MANIFEST 要確認。"; exit 1
fi

echo "== manifest =="; jq -C '.articles[] | {slug:.final_slug, score, passed}' "$MANIFEST" 2>/dev/null || cat "$MANIFEST"

# ---------- pass/held を判定 (LLM の passed に加え、シェル側でも score>=MIN を防御的に再確認) ----------
PASS_SLUGS=()
while IFS= read -r s; do [ -n "$s" ] && PASS_SLUGS+=("$s"); done \
  < <(jq -r --argjson min "${PUBLISH_MIN_SCORE:-90}" '.articles[] | select((.passed==true) and (((.score // 0)|tonumber?) // 0) >= $min) | .final_slug // empty' "$MANIFEST")
HELD_SLUGS=()
while IFS= read -r s; do [ -n "$s" ] && HELD_SLUGS+=("$s"); done \
  < <(jq -r --argjson min "${PUBLISH_MIN_SCORE:-90}" '.articles[] | select((.passed!=true) or (((.score // 0)|tonumber?) // 0) < $min) | .final_slug // empty' "$MANIFEST")

for slug in "${HELD_SLUGS[@]}"; do
  [ -z "$slug" ] && continue
  mkdir -p "$HOLDING/$slug"
  for lang in ja en; do
    f="src/lib/content/$lang/media/$slug.mdx"
    [ -f "$f" ] && mv "$f" "$HOLDING/$slug/$lang.mdx" && echo "held → holding: $slug ($lang)"
  done
done

# ---------- 公開候補が 0 ----------
if [ "${#PASS_SLUGS[@]}" -eq 0 ] || [ -z "${PASS_SLUGS[0]}" ]; then
  echo "公開候補 0 件 (全て holding)"
  write_ledger "$MANIFEST" "" ""
  notify "日次記事: 公開 0 / 保留 ${#HELD_SLUGS[@]}" "90点未達で全保留。holding/ を確認。"
  exit 0
fi

# ---------- サニタイズ: MDX を壊す生 autolink <https://…> を裸 URL へ ----------
# GFM の <url> autolink 記法を MDX(mdxjs) は JSX タグ開始と誤認し build が落ちる (held 常習犯)。
# 山括弧だけ剥がせば remark-gfm が裸 URL を安全に自動リンク化する。<Component …> 等には
# 一致しない (< の直後が http のときだけ置換)。sed -i の可搬性問題を避け temp file 方式。
for slug in "${PASS_SLUGS[@]}"; do
  [ -z "$slug" ] && continue
  for lang in ja en; do
    f="src/lib/content/$lang/media/$slug.mdx"
    [ -f "$f" ] || continue
    _tmp="$(mktemp)"
    if sed -E 's#<(https?://[^>[:space:]]+)>#\1#g' "$f" > "$_tmp" 2>/dev/null; then
      if ! cmp -s "$f" "$_tmp"; then echo "sanitize: 裸 autolink を修正 $f"; fi
      mv "$_tmp" "$f"
    else
      rm -f "$_tmp"
    fi
  done
done

# ---------- 品質ゲート: validate → build ----------
echo "== gate: validate:articles =="
if ! run_to_log "$STEP_TIMEOUT" "$RUNDIR/validate.log" npm run --silent validate:articles; then
  echo "validate:articles NG"; tail -30 "$RUNDIR/validate.log"
  for slug in "${PASS_SLUGS[@]}"; do
    mkdir -p "$HOLDING/$slug"; for lang in ja en; do f="src/lib/content/$lang/media/$slug.mdx"; [ -f "$f" ] && mv "$f" "$HOLDING/$slug/$lang.mdx"; done
  done
  write_ledger "$MANIFEST" "" ""
  notify "日次記事: validate 失敗" "検証NGで公開中止。全記事を holding に退避。$RUNDIR/validate.log"
  exit 1
fi
echo "validate OK"

echo "== gate: next build =="
if ! run_to_log "$STEP_TIMEOUT" "$RUNDIR/build.log" npm run --silent build; then
  echo "build NG"; tail -40 "$RUNDIR/build.log"
  for slug in "${PASS_SLUGS[@]}"; do
    mkdir -p "$HOLDING/$slug"; for lang in ja en; do f="src/lib/content/$lang/media/$slug.mdx"; [ -f "$f" ] && mv "$f" "$HOLDING/$slug/$lang.mdx"; done
  done
  git checkout -- . 2>/dev/null || true
  write_ledger "$MANIFEST" "" ""
  notify "日次記事: build 失敗" "next build NG で公開中止。全記事を holding に退避。$RUNDIR/build.log"
  exit 1
fi
echo "build OK"

# ---------- commit (allowlist: 実際に add できた PASS のファイルだけを公開・台帳記録) ----------
# PASS でも実ファイルが欠落/別名なら add されない。その slug は published/committed に含めず
# held 扱いに落とし、偽 published (恒久ロス) を防ぐ。
git reset -q -- src/lib/content 2>/dev/null || true
STAGED_SLUGS=()
for slug in "${PASS_SLUGS[@]}"; do
  [ -z "$slug" ] && continue
  added=0
  for lang in ja en; do
    f="src/lib/content/$lang/media/$slug.mdx"
    [ -f "$f" ] && git add "$f" && added=1
  done
  [ "$added" = 1 ] && STAGED_SLUGS+=("$slug")
done
# build(postbuild) が再生成した llms.txt も含める (公開記事集合と一致。sitemap は gitignore 済)
[ -f public/llms.txt ] && git add public/llms.txt
if [ "${#STAGED_SLUGS[@]}" -eq 0 ] || git diff --cached --quiet; then
  echo "stage 差分なし (公開できるファイルが無い) → 公開スキップ"
  write_ledger "$MANIFEST" "" ""
  notify "日次記事: 差分なし" "公開候補 ${#PASS_SLUGS[@]} 件だが add 可能なファイルが無い。要確認。"
  exit 1
fi
SLUGLIST=$(IFS=,; echo "${STAGED_SLUGS[*]}")
git commit -q -m "feat(media): 日次自動生成 ${#STAGED_SLUGS[@]}本 (${SLUGLIST})

自動生成ハーネス (automation/) による日次公開。eval>=${PUBLISH_MIN_SCORE}点のみ。

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" \
  || { echo "commit 失敗"; write_ledger "$MANIFEST" "" ""; notify "日次記事: commit 失敗" "要確認 $LOG"; exit 1; }
echo "committed: $SLUGLIST"

# ---------- push (成功時のみ台帳 published、失敗時は committed=次回rebaseで再送) ----------
PUSHED=0
if [ "$NO_PUSH" = 1 ]; then
  echo "--no-push: commit のみ (push しない)"
  notify "日次記事: commit のみ" "公開 ${#STAGED_SLUGS[@]} 件を commit (push保留)。手動 push を。"
else
  if git push origin "$BRANCH" 2>&1 | tail -3; then
    PUSHED=1; echo "pushed origin/$BRANCH"
    notify "日次記事 公開完了" "公開 ${#STAGED_SLUGS[@]} / 保留 ${#HELD_SLUGS[@]} (${DATE}) → Vercel デプロイ"
  else
    echo "push 失敗 (commit は済。次回 run の rebase で再送される)"
    notify "日次記事: push 失敗" "commit 済だが push 失敗。翌 run で自動再送 or 手動 git push を。$LOG"
  fi
fi

# ---------- 台帳更新 (push成功=published / commitのみ=committed。どちらも再選除外) ----------
if [ "$PUSHED" = 1 ]; then
  write_ledger "$MANIFEST" "$SLUGLIST" ""
else
  write_ledger "$MANIFEST" "" "$SLUGLIST"
fi

# ---------- INBOX 詳細 ----------
{
  echo ""
  echo "## $DATE 実行結果 ($TS)"
  echo "- 公開 (push): $( [ "$PUSHED" = 1 ] && echo "$SLUGLIST" || echo "${SLUGLIST} (commitのみ・push未)" )"
  echo "- 保留 (holding/): $( [ "${#HELD_SLUGS[@]}" -gt 0 ] && (IFS=,; echo "${HELD_SLUGS[*]}") || echo なし )"
  echo "- ログ: $LOG"
  [ "${#HELD_SLUGS[@]}" -gt 0 ] && echo "- 保留記事は automation/holding/<slug>/ を修正 → validate:articles → src/lib/content へ戻し、当日中に commit/push してください (翌 run 開始時に未コミットだと _reclaimed へ退避されます)。"
} >> "$INBOX"

echo "==== done: 公開 ${#STAGED_SLUGS[@]}(pushed=$PUSHED) / 保留 ${#HELD_SLUGS[@]} ===="
