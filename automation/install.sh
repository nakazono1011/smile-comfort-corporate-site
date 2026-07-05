#!/usr/bin/env bash
# install.sh — 日次アフィリエイト記事ハーネスをこの Mac に設置する。
#
#   bash automation/install.sh          # 設置 / 再設置 (冪等)
#   RUN_HOUR=6 RUN_MIN=7 bash automation/install.sh   # 実行時刻を変更
#
# やること:
#   1. 専用 publish clone を作成 (~/.smile-comfort/publish, 常に main で運用し dev 作業と分離)
#   2. npm ci + wrangler(未導入なら global install)
#   3. automation/env.sh を用意 (無ければ example からコピー)
#   4. 安定ランチャ ~/.smile-comfort/launch.sh を生成 (リポジトリ外・git の影響を受けない)
#   5. launchd plist を ~/Library/LaunchAgents に設置して有効化 (毎日 RUN_HOUR:RUN_MIN)
#   6. 前提チェック (claude ログイン / git push 認証 / R2 トークン)
set -euo pipefail

BASE="$HOME/.smile-comfort"
PUBLISH_REPO="${PUBLISH_REPO:-$BASE/publish}"
RUN_HOUR="${RUN_HOUR:-12}"
RUN_MIN="${RUN_MIN:-17}"
LABEL="com.smile-comfort.daily-articles"
PLIST_DST="$HOME/Library/LaunchAgents/$LABEL.plist"
UID_NUM="$(id -u)"

# このスクリプトのある dev リポジトリから origin URL を得る
SRC_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGIN_URL="$(git -C "$SRC_REPO" remote get-url origin 2>/dev/null || true)"
[ -n "$ORIGIN_URL" ] || { echo "ERROR: origin remote を検出できません ($SRC_REPO)"; exit 1; }

echo "=================================================="
echo " Smile Comfort 日次記事ハーネス インストール"
echo "  origin      : $ORIGIN_URL"
echo "  publish repo: $PUBLISH_REPO"
echo "  スケジュール : 毎日 ${RUN_HOUR}:$(printf '%02d' "$RUN_MIN")"
echo "=================================================="

mkdir -p "$BASE"

# ---- 1. publish clone ----
echo ""
echo "== 1. publish clone =="
if [ ! -d "$PUBLISH_REPO/.git" ]; then
  echo "clone 中 (数分かかることがあります)..."
  git clone "$ORIGIN_URL" "$PUBLISH_REPO"
else
  echo "既存 clone を使用"
fi
git -C "$PUBLISH_REPO" checkout main
git -C "$PUBLISH_REPO" pull --ff-only origin main || echo "WARN: pull に失敗 (後で pipeline が同期します)"

# ---- 2. deps ----
echo ""
echo "== 2. 依存 (npm ci) =="
( cd "$PUBLISH_REPO" && npm ci )

echo ""
echo "== 2b. wrangler =="
if command -v wrangler >/dev/null 2>&1; then
  echo "wrangler: $(command -v wrangler)"
else
  echo "wrangler 未導入 → npm i -g wrangler"
  npm i -g wrangler || echo "WARN: wrangler の global install に失敗。手動で 'npm i -g wrangler' を実行してください。"
fi

# ---- 3. env.sh ----
echo ""
echo "== 3. env.sh =="
ENVF="$PUBLISH_REPO/automation/env.sh"
if [ ! -f "$ENVF" ]; then
  cp "$PUBLISH_REPO/automation/env.sh.example" "$ENVF"
  chmod 600 "$ENVF"
  echo "⚠ $ENVF を作成しました。"
  echo "  → CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を必ず編集してください。"
  NEED_ENV_EDIT=1
else
  echo "既存 env.sh を使用"
  chmod 600 "$ENVF" 2>/dev/null || true
fi

# ---- 4. 安定ランチャ ----
echo ""
echo "== 4. ランチャ生成 =="
LAUNCHER="$BASE/launch.sh"
cat > "$LAUNCHER" <<LAUNCH
#!/usr/bin/env bash
# stable launcher (自動生成) — launchd から呼ばれる。リポジトリ外にあり git 操作の影響を受けない。
set -uo pipefail
PUBLISH_REPO="$PUBLISH_REPO"
[ -f "\$PUBLISH_REPO/automation/env.sh" ] && . "\$PUBLISH_REPO/automation/env.sh"
cd "\$PUBLISH_REPO" || exit 1
# pipeline.sh 自体を最新化してから exec (exec 時に fresh に読み直されるため実行中書換の心配なし)
git fetch origin main >/dev/null 2>&1 || true
git checkout main >/dev/null 2>&1 || true
git checkout -- . >/dev/null 2>&1 || true
git pull --ff-only origin main >/dev/null 2>&1 || true
exec /bin/bash "\$PUBLISH_REPO/automation/pipeline.sh"
LAUNCH
chmod +x "$LAUNCHER"
echo "生成: $LAUNCHER"

# ---- 5. launchd ----
echo ""
echo "== 5. launchd 登録 =="
mkdir -p "$HOME/Library/LaunchAgents"
sed -e "s#__LAUNCHER__#$LAUNCHER#g" \
    -e "s#__BASE__#$BASE#g" \
    -e "s#__HOUR__#$RUN_HOUR#g" \
    -e "s#__MIN__#$RUN_MIN#g" \
    "$PUBLISH_REPO/automation/com.smile-comfort.daily-articles.plist.tmpl" > "$PLIST_DST"
echo "設置: $PLIST_DST"

launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID_NUM" "$PLIST_DST"
launchctl enable "gui/$UID_NUM/$LABEL"
echo "launchd に登録・有効化しました。"

# ---- 6. 前提チェック ----
echo ""
echo "== 6. 前提チェック =="
ok(){ echo "  ✓ $1"; }
ng(){ echo "  ✗ $1"; }

command -v node    >/dev/null 2>&1 && ok "node    $(node -v)"        || ng "node が無い"
command -v claude  >/dev/null 2>&1 && ok "claude  $(claude --version 2>/dev/null)" || ng "claude が無い"
command -v wrangler>/dev/null 2>&1 && ok "wrangler $(wrangler --version 2>/dev/null | head -1)" || ng "wrangler が無い (npm i -g wrangler)"
command -v jq      >/dev/null 2>&1 && ok "jq"                        || ng "jq が無い"

# claude ログイン確認 (軽量): 設定ディレクトリの有無
[ -d "$HOME/.claude" ] && ok "claude 設定あり (~/.claude)" || ng "claude 未ログインの可能性 → 一度 'claude' を対話起動してログインを"

# git push 認証 (dry-run) — 実際には push しない
if git -C "$PUBLISH_REPO" push --dry-run origin main >/dev/null 2>&1; then
  ok "git push 認証 OK (osxkeychain)"
else
  ng "git push 認証に失敗 → 一度手動で 'git -C $PUBLISH_REPO push origin main' を実行し keychain に資格情報を保存 (または PAT を credential.helper store に登録)"
fi

# R2 トークン
# shellcheck disable=SC1090
[ -f "$ENVF" ] && . "$ENVF"
if [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ "${CLOUDFLARE_API_TOKEN}" != "__PUT_YOUR_R2_TOKEN_HERE__" ]; then
  if command -v wrangler >/dev/null 2>&1 && CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" wrangler r2 bucket list >/dev/null 2>&1; then
    ok "R2 トークン OK (wrangler r2 bucket list 成功)"
  else
    ng "R2 トークンで bucket list に失敗 → トークン権限 (Object Read&Write) を確認"
  fi
else
  ng "CLOUDFLARE_API_TOKEN 未設定 → $ENVF を編集"
fi

echo ""
echo "=================================================="
echo " インストール完了。"
echo "   今すぐ試す(生成→公開)   : launchctl kickstart -k gui/$UID_NUM/$LABEL"
echo "   生成せず選定だけ確認     : ( cd $PUBLISH_REPO && automation/pipeline.sh --dry-run )"
echo "   生成するが公開しない     : ( cd $PUBLISH_REPO && automation/pipeline.sh --no-push )"
echo "   ログ                     : tail -f $BASE/launchd.out.log  /  $PUBLISH_REPO/automation/logs/"
echo "   レビュー待ち(保留/結果)  : $PUBLISH_REPO/automation/INBOX.md"
echo "   停止/削除                : bash $PUBLISH_REPO/automation/uninstall.sh"
[ "${NEED_ENV_EDIT:-0}" = 1 ] && echo "   ★ 先に $ENVF の R2 トークンを編集してから kickstart してください。"
echo "=================================================="
