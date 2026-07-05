---
name: run-affiliate-article
description: 「アフィリエイト記事作って」「Next Engine 記事」「Bright Data 記事」「1Password 記事」で発動。X検索→ja/en MDX生成→評価ループ→画像生成→R2アップロードまでを一気通貫で回す run。複数記事の一括 (並列) 生成にも対応。
user-invocable: true
argument-hint: "<product> <topic>  |  改行区切りで複数記事  |  --refresh <slug> で既存記事の鮮度更新"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Skill, Agent
---

# run-affiliate-article

合同会社スマイルコンフォートのメディアブログ用に、1Password / Bright Data / Next Engine のアフィリエイト記事を ja/en 同時生成するオーケストレーター。X 検索で一次情報を取得し、generator/evaluator ループで品質を担保。サムネは **wrap-affiliate-thumbnail** (business-headline mode、誠実トーン)、説明図は wrap-ai-image-detail-illustration で生成、wrangler で Cloudflare R2 にアップロード。**複数 topic を 1 セッションで並列生成** にも対応 (Agent ツール経由で subagent 並列起動)。

**Prerequisites**:
- `wrangler` (Cloudflare CLI) が PATH にあり `wrangler login` 済み (R2 へのアップロード用)
- `~/.hermes/auth.json` または `XAI_API_KEY` (run-x-search 用)
- Codex (画像生成用、wrap-affiliate-thumbnail / wrap-ai-image-detail-illustration の依存)

## Input / Output

- **Input**: `$ARGUMENTS`
  - **単発モード**: `"<product> <topic>"` (例: `nextengine 楽天連携の運用Tips`)
  - **並列モード**: 改行区切りで複数行 (例: 3 行なら 3 記事を並列生成)
- **Output**:
  - `<repo>/src/lib/content/ja/media/<slug>.mdx`
  - `<repo>/src/lib/content/en/media/<slug>.mdx`
  - Cloudflare R2 `corporate-images` バケットに `<slug>/cover.webp`, `og.webp`, `figure-01.webp`, ...
  - 中間ファイル: `<repo>/output/<slug>/` (単発) または `<repo>/output/_batch-<ts>/<slug>/` (並列) 配下に context / metadata / eval JSON

## 想定リポジトリ

- パス: `git rev-parse --show-toplevel` で自動検出 (worktree でも正しく解決される。旧・固定パスは廃止)
- 環境変数 `SMILE_COMFORT_REPO` でオーバーライド可

## フロー (単発モード)

```
Step 0:   引数パース・モード判定 (single / batch / refresh)・前提検証・LOCALES 決定
Step 1:   既存記事メタを抽出 (existing-slugs.json / existing-titles.json / existing-records.json)
Step 1.5: テーマ選定 MECE 検証 (subtopics.json と既存 slug を突合、未使用セル + 関連記事候補)
Step 1.6: FINAL_SLUG 確定 (MECE 優先・衝突回避。__TEMP__ 方式は廃止)
Step 2:   run-x-search で X 最新情報取得 (x-search.json)
Step 2.5: SERP リサーチ (WebSearch → serp-brief.json。intent_fit 用)
Step 3:   assign-affiliate-article-generator で ja(/en) MDX 生成 [iter=1] (reserved_slug 固定)
Step 4:   assign-affiliate-article-evaluator で採点 (11 軸 145 点)
Step 5:   90 点未満なら feedback を generator に戻して再生成 (最大 3 周)
Step 6:   wrap-affiliate-thumbnail で cover + og を 2 並列生成 → 1 枚採用
Step 7:   wrap-ai-image-detail-illustration で figure-01, figure-02 を 2 並列生成
Step 8:   wrangler r2 で `corporate-images` バケットに画像アップロード (--remote 必須)
Step 9:   MDX 内の画像 URL を確認・修正 (sed はファイル名保持)
Step 9.5: 兄弟記事へ逆リンクをバックフィル (内部リンク双方向化)
Step 10:  完了報告 + 人手最終チェックリスト
```

> ほかに **batch モード** (改行区切り複数 topic → subagent 並列)、**refresh モード** (`--refresh <slug>` で既存記事の価格・鮮度更新) がある。末尾の各セクション参照。

---

## Step 0: 引数パース・モード判定・前提検証

```bash
ARGS="$ARGUMENTS"
REPO="${SMILE_COMFORT_REPO:-$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")}"

# モード判定: --refresh <slug> は鮮度更新モード、改行含みは並列モード、それ以外は単発
case "$ARGS" in
  --refresh\ *)
    REFRESH_SLUG="$(echo "$ARGS" | awk '{print $2}')"
    echo "MODE: refresh (${REFRESH_SLUG})"
    # → 「## Refresh モード」セクションへジャンプ (以降の単発フローは実行しない)
    ;;
  *)
    LINE_COUNT="$(printf "%s" "$ARGS" | grep -c '^' || echo 1)"
    if [ "$LINE_COUNT" -gt 1 ]; then
      echo "MODE: batch (${LINE_COUNT} topics)"
      # → 並列バッチ運用セクション (Step P0 以降) にジャンプ
    else
      echo "MODE: single"
    fi
    ;;
esac

# 以下は単発モード (LINE_COUNT == 1)
PRODUCT="$(echo "$ARGS" | awk '{print $1}')"
TOPIC="$(echo "$ARGS" | cut -d' ' -f2-)"

# product バリデーション
case "$PRODUCT" in
  1password|brightdata|nextengine) ;;
  *)
    echo "ERROR: product must be one of: 1password, brightdata, nextengine"
    echo "Got: '$PRODUCT'"
    exit 1
    ;;
esac

# ロケール戦略: nextengine は英語圏の検索需要が無いため ja 単独。他は ja/en 両方。
case "$PRODUCT" in
  nextengine) LOCALES='["ja"]' ;;
  *)          LOCALES='["ja", "en"]' ;;
esac

# slug の種を作る (Step 1.5 で MECE 未使用セル優先 + 既存衝突回避して FINAL_SLUG に確定する)
SLUG_BASE="$(echo "$TOPIC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9一-龯ぁ-んァ-ヶ]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//' | cut -c1-50)"
TS="$(date +%s)"
WORKDIR="${REPO}/output/${PRODUCT}-${SLUG_BASE}-${TS}"
mkdir -p "${WORKDIR}/images"

echo "WORKDIR: ${WORKDIR}"
echo "PRODUCT: ${PRODUCT}"
echo "TOPIC:   ${TOPIC}"
echo "LOCALES: ${LOCALES}"
```

---

## Step 1: 既存記事メタを抽出

`src/lib/content/ja/media/` 配下の MDX から `slug`, `title`, `tags`, `product` を抽出して JSON に。

```bash
node - <<'NODE' "${REPO}" "${WORKDIR}"
const fs = require("fs"), path = require("path");
const [repo, work] = process.argv.slice(2);
const matter = require("gray-matter");
const dirs = ["ja", "en"];
const all = { slugs: [], titles_ja: [], titles_en: [], records: [] };

for (const lang of dirs) {
  const d = path.join(repo, "src/lib/content", lang, "media");
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".mdx")) continue;
    const src = fs.readFileSync(path.join(d, f), "utf8");
    const { data } = matter(src);
    const slug = f.replace(/\.mdx$/, "");
    if (!all.slugs.includes(slug)) all.slugs.push(slug);
    if (lang === "ja" && data.title) all.titles_ja.push(data.title);
    if (lang === "en" && data.title) all.titles_en.push(data.title);
    all.records.push({ slug, lang, title: data.title, tags: data.tags ?? [], product: data.product ?? null });
  }
}
fs.writeFileSync(path.join(work, "existing-slugs.json"), JSON.stringify(all.slugs, null, 2));
fs.writeFileSync(path.join(work, "existing-titles.json"), JSON.stringify({ ja: all.titles_ja, en: all.titles_en }, null, 2));
fs.writeFileSync(path.join(work, "existing-records.json"), JSON.stringify(all.records, null, 2));
console.log(`existing: ${all.slugs.length} slugs, ja=${all.titles_ja.length}, en=${all.titles_en.length}`);
NODE
```

> 注: `gray-matter` はリポジトリの `node_modules` 内に存在することを前提。空リポでも問題なく動く。

---

## Step 1.5: テーマ選定 MECE 検証

ref-affiliate-article §2.5 に基づき、機械的にチェックする。

```bash
node - <<'NODE' "${WORKDIR}" "${PRODUCT}" "${TOPIC}" "${REPO}"
const fs = require("fs"), path = require("path");
const [work, product, topic, repo] = process.argv.slice(2);
// NOTE: 単一引用符 heredoc (<<'NODE') 内はシェル変数を展開しない。パスは argv 経由で渡す。
const sub = JSON.parse(fs.readFileSync(path.join(repo, ".claude/skills/ref-affiliate-article/subtopics.json"), "utf8"));
const slugs = new Set(JSON.parse(fs.readFileSync(path.join(work, "existing-slugs.json"), "utf8")));
const records = JSON.parse(fs.readFileSync(path.join(work, "existing-records.json"), "utf8"));

// 未使用セルの洗い出し
const cats = sub.products[product]?.categories ?? {};
const unused = [];
for (const [cat, info] of Object.entries(cats)) {
  for (const ex of info.examples ?? []) {
    if (!slugs.has(ex.slug_pattern)) unused.push({ category: cat, slug_pattern: ex.slug_pattern, topic: ex.topic });
  }
}

// 関連記事候補 (同 product 優先、同カテゴリ次点)
const related = records
  .filter(r => r.product === product || (r.tags ?? []).some(t => topic.includes(t)))
  .slice(0, 5)
  .map(r => ({ slug: r.slug, title: r.title, lang: r.lang, tags: r.tags }));

fs.writeFileSync(path.join(work, "unused-cells.json"), JSON.stringify(unused, null, 2));
fs.writeFileSync(path.join(work, "related-candidates.json"), JSON.stringify(related, null, 2));
console.log(`unused cells: ${unused.length}, related candidates: ${related.length}`);
NODE
```

- `unused-cells.json`: generator が未使用 slug を優先的に選ぶ判断材料
- `related-candidates.json`: generator が本文中に最低 2 件を自然リンクで埋め込む対象
- 既存記事 0 本 (初回パイロット) なら両ファイルとも 0 件で OK。generator は `unused-cells` の候補から優先選択する

### Step 1.6: FINAL_SLUG を確定 (`__TEMP__` 方式は廃止)

親がここで slug を一意化し、以降は**具象パス**を generator に渡す (単発・並列で方式統一)。MECE 未使用セルの `slug_pattern` を最優先、無ければ topic 由来。**年号は焼き込まない** (ref §5.1)。

```bash
FINAL_SLUG="$(node - "${WORKDIR}" "${PRODUCT}" "${SLUG_BASE}" <<'NODE'
const fs=require("fs"),path=require("path");
const [work,product,base]=process.argv.slice(2);
const existing=new Set(JSON.parse(fs.readFileSync(path.join(work,"existing-slugs.json"),"utf8")));
let unused=[];try{unused=JSON.parse(fs.readFileSync(path.join(work,"unused-cells.json"),"utf8"));}catch{}
// 未使用セルの先頭を既定採用 (親が topic により近いセルを選んで上書きしてよい)
let slug=(unused[0]&&unused[0].slug_pattern)||`${product}-${base}`;
let s=slug,n=1;while(existing.has(s)){n++;s=`${slug}-${n}`;}
process.stdout.write(s);
NODE
)"
JA_MDX="${REPO}/src/lib/content/ja/media/${FINAL_SLUG}.mdx"
EN_MDX="${REPO}/src/lib/content/en/media/${FINAL_SLUG}.mdx"
echo "FINAL_SLUG: ${FINAL_SLUG}"
```

> 親 (Claude) は `unused-cells.json` の中から topic に最も意味的に近いセルを選び、必要なら `FINAL_SLUG` を上書きしてよい。generator にはこの `FINAL_SLUG` を `reserved_slug` として渡し、**generator 側で slug を再生成させない** (並列バッチ P1 と同じ流儀)。

---

## Step 2: X 検索 (run-x-search)

Skill ツール経由で `run-x-search` を呼び、結果を `x-search.json` に書き出す:

```
# Skill ツールで呼ぶ
Skill: run-x-search
args: "<topic> + <product 公式アカウント> OR <キーワード> --json --from-date YYYY-MM-DD"
```

呼び出し後、stdout を `${WORKDIR}/x-search.json` に書き出す。

X 検索結果が空 or エラーの場合は空配列 `[]` を JSON で書き出して進める (採点で `x_embed` が減点される可能性を受容)。

---

## Step 2.5: SERP リサーチ (intent_fit 用)

WebSearch で対象キーワードの上位結果を調べ、**上位記事のタイトル・頻出見出し・PAA (People Also Ask)** を `serp-brief.json` に書き出す。generator が本文構成と FAQ を検索意図に合わせるための材料 (evaluator の `intent_fit` 軸が参照)。

```
WebSearch: "<主要キーワード ja>"   (例: "Next Engine 料金")
WebSearch: "<主要キーワード en>"   (locales に en を含む場合のみ)
```

結果から以下を `${WORKDIR}/serp-brief.json` に書く:

```json
{
  "keyword_ja": "...",
  "keyword_en": "...",
  "top_titles": ["上位1", "上位2", "..."],
  "common_headings": ["上位記事に頻出する H2/H3 論点", "..."],
  "paa": ["よくある質問 (PAA) 1", "..."],
  "intent_signal": "transactional | comparative | how-to | informational"
}
```

- WebSearch が使えない / 結果が薄い場合は `{}` を書いて進める (intent_fit は減点しない。構成は ref §4.2 のテンプレのみで担保)
- **競合の見出しをコピーしない**。論点カバレッジの参考に留め、独自の切り口・弊社知見で差別化する

---

## Step 3: assign-affiliate-article-generator (iter=1)

context JSON を作成して Skill 経由で呼ぶ:

```bash
ITER=1
SCHEMA_PATH="${REPO}/.claude/skills/assign-affiliate-article-evaluator/eval-schema.json"
REF_PATH="${REPO}/.claude/skills/ref-affiliate-article/SKILL.md"
VOICE_PATH="${REPO}/.claude/skills/assign-affiliate-article-generator/references/voice-guide.md"
PRODUCT_REF="${REPO}/.claude/skills/assign-affiliate-article-generator/references/product-${PRODUCT}.md"
TEMPLATE="${REPO}/.claude/skills/assign-affiliate-article-generator/references/article-template.mdx.tmpl"
TEMPLATES_DIR="${REPO}/.claude/skills/assign-affiliate-article-generator/references/templates"
SUBTOPICS="${REPO}/.claude/skills/ref-affiliate-article/subtopics.json"

cat > "${WORKDIR}/gen-ctx-iter${ITER}.json" <<EOF
{
  "project_dir": "${WORKDIR}",
  "name": "${FINAL_SLUG}",
  "product": "${PRODUCT}",
  "topic": "${TOPIC}",
  "reserved_slug": "${FINAL_SLUG}",
  "locales": ${LOCALES},
  "x_search_results_path": "${WORKDIR}/x-search.json",
  "serp_brief_path": "${WORKDIR}/serp-brief.json",
  "existing_slugs_path": "${WORKDIR}/existing-slugs.json",
  "existing_titles_path": "${WORKDIR}/existing-titles.json",
  "unused_cells_path": "${WORKDIR}/unused-cells.json",
  "related_candidates_path": "${WORKDIR}/related-candidates.json",
  "subtopics_path": "${SUBTOPICS}",
  "iteration": ${ITER},
  "output_contract": {
    "ja_mdx_path": "${JA_MDX}",
    "en_mdx_path": "${EN_MDX}",
    "metadata_json_path": "${WORKDIR}/metadata.json",
    "ref_skill_md": "${REF_PATH}",
    "voice_guide": "${VOICE_PATH}",
    "product_ref": "${PRODUCT_REF}",
    "template": "${TEMPLATE}",
    "templates_dir": "${TEMPLATES_DIR}"
  }
}
EOF
echo "CONTEXT:${WORKDIR}/gen-ctx-iter${ITER}.json"
```

> **`reserved_slug` 固定**: generator は slug を再生成せず、`ja_mdx_path` / `en_mdx_path` の具象パスにそのまま書き込む。`locales` が `["ja"]` なら en は生成しない (`en_mdx_path` は無視される)。

Skill ツールで呼ぶ:
```
Skill: assign-affiliate-article-generator
args: ${WORKDIR}/gen-ctx-iter1.json
```

generator は指定パスに ja(/en) の MDX と metadata.json を Write する。`FINAL_SLUG` / `JA_MDX` / `EN_MDX` は Step 1.6 で確定済みなので、親はそのまま以降のステップで使う (metadata.json の `slug` が `FINAL_SLUG` と一致することを念のため検証してよい)。

---

## Step 4: assign-affiliate-article-evaluator (iter=1)

```bash
EVAL_OUT="${WORKDIR}/eval-iter${ITER}.json"
FEEDBACK_OUT="${WORKDIR}/eval-iter${ITER}-feedback.md"

cat > "${WORKDIR}/eval-ctx-iter${ITER}.json" <<EOF
{
  "project_dir": "${WORKDIR}",
  "name": "${FINAL_SLUG}",
  "ja_mdx_path": "${JA_MDX}",
  "en_mdx_path": "${EN_MDX}",
  "metadata_json_path": "${WORKDIR}/metadata.json",
  "existing_slugs_path": "${WORKDIR}/existing-slugs.json",
  "existing_titles_path": "${WORKDIR}/existing-titles.json",
  "x_search_results_path": "${WORKDIR}/x-search.json",
  "serp_brief_path": "${WORKDIR}/serp-brief.json",
  "locales": ${LOCALES},
  "iteration": ${ITER},
  "output_contract": {
    "eval_file": "${EVAL_OUT}",
    "feedback_file": "${FEEDBACK_OUT}",
    "schema": "${SCHEMA_PATH}",
    "ref": "${REF_PATH}"
  }
}
EOF
echo "CONTEXT:${WORKDIR}/eval-ctx-iter${ITER}.json"
```

> `locales` が `["ja"]` の場合、evaluator は `ja_en_parity` を満点固定 (N/A) にし、`en_mdx_path` を無視する。

> **注**: 初回 (iter=1) は `previous_eval_path` を含めない。iter≥2 では Step 5 のループ内で `previous_eval_path` を追加し、evaluator が Codex 委譲を間引けるようにする (2026-05-27 改訂)。

Skill 呼び出し:
```
Skill: assign-affiliate-article-evaluator
args: ${WORKDIR}/eval-ctx-iter1.json
```

評価結果 JSON から `quality.overall` と `passed` を取得:
```bash
SCORE="$(jq -r '.quality.overall' "${EVAL_OUT}")"
PASSED="$(jq -r '.passed' "${EVAL_OUT}")"
```

---

## Step 5: フィードバックループ (最大 3 周)

```bash
MAX_ITER=3
while [ "$PASSED" != "true" ] && [ "$ITER" -lt "$MAX_ITER" ]; do
  ITER=$((ITER + 1))

  # generator を修正動作で呼ぶ (feedback_path 付き)
  cat > "${WORKDIR}/gen-ctx-iter${ITER}.json" <<EOF
{
  "project_dir": "${WORKDIR}",
  "name": "${FINAL_SLUG}",
  "product": "${PRODUCT}",
  "topic": "${TOPIC}",
  "reserved_slug": "${FINAL_SLUG}",
  "locales": ${LOCALES},
  "x_search_results_path": "${WORKDIR}/x-search.json",
  "serp_brief_path": "${WORKDIR}/serp-brief.json",
  "existing_slugs_path": "${WORKDIR}/existing-slugs.json",
  "existing_titles_path": "${WORKDIR}/existing-titles.json",
  "subtopics_path": "${SUBTOPICS}",
  "feedback_path": "${WORKDIR}/eval-iter$((ITER-1))-feedback.md",
  "previous_metadata_path": "${WORKDIR}/metadata.json",
  "iteration": ${ITER},
  "output_contract": {
    "ja_mdx_path": "${JA_MDX}",
    "en_mdx_path": "${EN_MDX}",
    "metadata_json_path": "${WORKDIR}/metadata.json",
    "ref_skill_md": "${REF_PATH}",
    "voice_guide": "${VOICE_PATH}",
    "product_ref": "${PRODUCT_REF}",
    "template": "${TEMPLATE}",
    "templates_dir": "${TEMPLATES_DIR}"
  }
}
EOF
  echo "CONTEXT:${WORKDIR}/gen-ctx-iter${ITER}.json"
  # Skill: assign-affiliate-article-generator → 修正動作

  # 再評価 (previous_eval_path を渡して Codex fact-check を間引く)
  cat > "${WORKDIR}/eval-ctx-iter${ITER}.json" <<EOF
{
  "ja_mdx_path": "${JA_MDX}",
  "en_mdx_path": "${EN_MDX}",
  "metadata_json_path": "${WORKDIR}/metadata.json",
  "existing_slugs_path": "${WORKDIR}/existing-slugs.json",
  "existing_titles_path": "${WORKDIR}/existing-titles.json",
  "x_search_results_path": "${WORKDIR}/x-search.json",
  "iteration": ${ITER},
  "previous_eval_path": "${WORKDIR}/eval-iter$((ITER-1)).json",
  "output_contract": {
    "eval_file": "${WORKDIR}/eval-iter${ITER}.json",
    "feedback_file": "${WORKDIR}/eval-iter${ITER}-feedback.md",
    "schema": "${SCHEMA_PATH}",
    "ref": "${REF_PATH}"
  }
}
EOF
  echo "CONTEXT:${WORKDIR}/eval-ctx-iter${ITER}.json"
  # Skill: assign-affiliate-article-evaluator
  # 注: previous_eval_path を渡すことで evaluator が前回 fact_checks を流用 (中間 iter のみ Codex 委譲スキップ、最終確認だけ実行)

  SCORE="$(jq -r '.quality.overall' "${WORKDIR}/eval-iter${ITER}.json")"
  PASSED="$(jq -r '.passed' "${WORKDIR}/eval-iter${ITER}.json")"
done

if [ "$PASSED" != "true" ]; then
  echo "WARN: 3周ループで90点未達 (最終スコア=${SCORE})。MDXは出力済みなので人間レビューに渡す。"
fi
```

実際は Bash ループではなく、Claude (parent) が JSON を読んで判断する。各 iter で Skill 呼び出しを順次行う。

---

## Step 6: wrap-affiliate-thumbnail で cover + og 生成

**アフィリエイト記事用に `wrap-affiliate-thumbnail` を使用 (旧 wrap-thumbnails ではない)**。トーン (ビジネス・誠実・煽りなし) とタイトル必須を保証する。

```
Skill: wrap-affiliate-thumbnail
args: "${WORKDIR}/images cover {{metadata.title.ja}} {{metadata.subtitle_for_cover}} --category {{metadata.category}} --logo {{metadata.logo_url}} --accent {{accent_theme_for_product}} --n 2"
```

product → accent-theme マッピング (2026-05-23 改訂):
- `brightdata` → `navy` (現状維持)
- `1password` → `blue` (1Password 公式ブランドブルー #0572EC 系。旧 teal から変更)
- `nextengine` → `orange` (Next Engine 公式オレンジ #EA580C 系。旧 light から変更)

各テーマの詳細は `wrap-affiliate-thumbnail` SKILL.md と `~/.claude/skills/run-thumbnail/config.json` の business-headline mode を参照。3 製品のサムネが視覚的に明確に区別できるよう公式ブランドカラーで再設計済み。

2 並列で生成、最も良いものを 1 枚採用。Claude (parent) が結果を確認して 1 枚を選び `cover.webp` にリネーム。同様に `og.webp` も生成。

> **生成枚数の方針 (2026-05-27 改訂)**: コスト/時間優先で `--n 2` を標準とする。`og` は cover と subtitle 差分が少ないため 2 並列で十分。品質バラつきが心配な目玉記事のみ `--n 4` に引き上げる。

実装メモ:
- wrap-affiliate-thumbnail の出力先と命名規則は同 skill の SKILL.md を参照
- mode は `business-headline` 固定 (wrap が強制)。**他 mode を指定すると wrap がエラー**
- 採用しなかった候補は `${WORKDIR}/images/_rejected/` 等に退避
- ロゴが取れない場合は `--logo` を省略

---

## Step 7: wrap-ai-image-detail-illustration で figure 生成

metadata.json の `image_briefs.figures[]` をループして並列起動:

```
For each figure in metadata.image_briefs.figures:
  Skill: wrap-ai-image-detail-illustration
  args: "${WORKDIR}/images ${figure.id} ${figure.prompt} --mode ${figure.mode} --n 2"
```

各 figure につき 2 並列生成 → 1 枚採用 → `figure-01.webp`, `figure-02.webp` にリネーム。

> **生成枚数の方針 (2026-05-27 改訂)**: コスト/時間優先で `--n 2` が標準。figure は MDX 本文の差し込みなので「2 枚並べて良い方を採用」で十分。`--n 4` は figure が記事の主軸 (例: 比較図 1 枚で勝負する pillar 記事) のときのみ。

---

## Step 8: wrangler R2 アップロード

```bash
BUCKET="corporate-images"
SLUG="${FINAL_SLUG}"
IMG_DIR="${WORKDIR}/images"

for img in cover og figure-01 figure-02 figure-03; do
  src="${IMG_DIR}/${img}.webp"
  [ -f "$src" ] || continue
  remote="${SLUG}/${img}.webp"
  wrangler r2 object put "${BUCKET}/${remote}" --file="$src" --content-type="image/webp" --cache-control="public, max-age=31536000, immutable"
  echo "Uploaded: r2://${BUCKET}/${remote} → https://img.smile-comfort.com/${remote}"
done
```

> 認証エラー (`wrangler login` 未実行) なら親が「`wrangler login` を実行してから retry」とユーザーに報告して停止。
> 画像が R2 に上がる前に MDX を公開すると 404 になるため、**この Step 完了まで本番デプロイは禁止**。

---

## Step 9: MDX 内の URL 整合確認

frontmatter `cover` / `heroImage` / `ogImage` と本文 `<Figure src="..." />` が `https://img.smile-comfort.com/${FINAL_SLUG}/...` で始まることを確認する。`locales` が ja 単独なら EN_MDX は無いのでスキップ。

```bash
FILES="${JA_MDX}"; [ -f "${EN_MDX}" ] && FILES="${FILES} ${EN_MDX}"
grep -E 'img\.smile-comfort\.com' ${FILES} >/dev/null || echo "WARN: 画像URLが期待形式と違う"

# 相対パス /images/<dir>/<file>.webp が紛れていたら R2 URL に修正 (ファイル名は保持)
sed -i.bak -E "s#/images/[A-Za-z0-9_-]+/([A-Za-z0-9_.-]+)#https://img.smile-comfort.com/${FINAL_SLUG}/\1#g" ${FILES}
rm -f "${JA_MDX}.bak" "${EN_MDX}.bak" 2>/dev/null || true
```

> 旧実装の sed (`s|/images/[^"]*|.../${SLUG}/|g`) はディレクトリごと潰してファイル名 (`figure-01.webp` 等) を落とす不具合があった。上記はキャプチャ `\1` でファイル名を保持する。

---

## Step 9.5: 兄弟記事への逆リンク (内部リンクのバックフィル)

新記事は既存記事へリンクするが、**既存記事から新記事への逆リンクが無い**と内部リンクが一方通行になり、新記事にリンクジュースが回らない。関連の強い既存記事 1〜2 本に、新記事への自然リンクを 1 文追記する。

1. `related-candidates.json` (同 product・関連度上位) から 1〜2 本を選ぶ
2. 各記事の ja(/en) MDX の文脈が合う H2 セクションに `[新記事のアンカー](/media/${FINAL_SLUG})` を **1 文** 自然挿入 (無機質なリストにしない。ref §9)。en は `/en/media/${FINAL_SLUG}`
3. 変更した既存記事は `updated` を当日日付に更新
4. 逆リンク先が無い (初期記事) 場合・関連度が低い場合はスキップ

> やり過ぎ注意: 1 記事につき逆リンクは 1 本まで。関連度が低い記事に挿すと SEO スパムに見える。

---

## Step 10: 完了報告

```
## アフィリエイト記事生成完了

- product: ${PRODUCT}
- topic: ${TOPIC}
- slug: ${FINAL_SLUG}
- 最終スコア: ${SCORE}/100 (合格: ${PASSED})
- ループ回数: ${ITER}/3

### 出力
- ja: ${JA_MDX}
- en: ${EN_MDX}
- metadata: ${WORKDIR}/metadata.json

### R2 アップロード
- https://img.smile-comfort.com/${FINAL_SLUG}/cover.webp
- https://img.smile-comfort.com/${FINAL_SLUG}/og.webp
- https://img.smile-comfort.com/${FINAL_SLUG}/figure-01.webp
- ...

### 確認手順 (人手最終チェックリスト)
1. `cd ${REPO} && npm run dev`
2. http://localhost:3000/media/${FINAL_SLUG} (en があれば /en/media/${FINAL_SLUG}) を開く
3. [ ] ヒーロー直下に**広告開示行**が出る / 本文末尾に PR 注記がある
4. [ ] 本文の AF リンクに `rel="sponsored nofollow ..."` が付く (要素検証)、CTA リンク先が config と一致
5. [ ] 価格・数値に**公式出典 (脚注)** がある / 「※情報は…時点」がある
6. [ ] TweetCard / Figure が描画される / FAQ が表示される (二重表示なし)
7. [ ] intent 別必須ブロック (料金シミュ / 比較表 / 手順 等) と「向いている人・向いていない人」がある
8. [ ] `npm run build` が通る
```

不合格時は:

```
### 評価 90 点未達 (${SCORE}/100)
- 軸別: ...
- 人間レビューの観点: ${WORKDIR}/eval-iter${ITER}-feedback.md
- MDX は出力済み。手動修正の上で再度 evaluator にかけてください
```

---

## Refresh モード (`--refresh <slug>`)

既に公開済みの記事の**鮮度だけを更新**する軽量モード。新規生成はしない。四半期ごと、または価格改定を検知したときに回す想定。価格・仕様が古いまま放置されると `factual_accuracy` を毀損し信頼を失うため。

```bash
REPO="${SMILE_COMFORT_REPO:-$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")}"
SLUG="${REFRESH_SLUG}"
JA_MDX="${REPO}/src/lib/content/ja/media/${SLUG}.mdx"
EN_MDX="${REPO}/src/lib/content/en/media/${SLUG}.mdx"
PRODUCT="$(grep -E '^product:' "${JA_MDX}" | head -1 | sed 's/product:\s*//; s/["'\'' ]//g')"
WORKDIR="${REPO}/output/_refresh-${SLUG}-$(date +%s)"; mkdir -p "${WORKDIR}"
[ -f "${JA_MDX}" ] || { echo "ERROR: ${JA_MDX} が無い"; exit 1; }
```

### 手順

1. **fact-check のみ evaluator を呼ぶ**: `factual_accuracy` (Codex) と `link_health` だけを実行する context を作る (他軸はスキップしてよい)。Codex に公式 URL (§2.4 の product 別 URL) を WebFetch させ、本文の価格・数値・仕様と突合
2. **差分があれば generator を修正動作で呼ぶ**: feedback に「公式は X だが本文は Y」を列挙。generator は該当箇所の数値と「※情報は YYYY-MM-DD 時点」を当日に更新 (削除ではなく更新)
3. **`updated` フィールドを当日日付に更新** (ja/en 両方。`date` は据え置き = 初出日を保持)
4. 差分ゼロなら `updated` だけ当日にするかは任意 (無意味な lastmod 更新を避けるなら据え置き推奨)
5. 画像・R2 は原則触らない (価格表 Figure が古い場合のみ figure を再生成 → R2 再アップロード)
6. 完了報告に「更新した数値・箇所」「更新前後の値」「据え置いた項目」を明記

> refresh は**数値の正確性が目的**。文体リライトや構成変更はしない (別途通常フローで)。`date` を書き換えない (SEO 上の初出日を保つ)。

---

## Gotchas

- **Skill ツール呼び出しは fork 実行**: context: fork の skill (generator / evaluator) は別コンテキストで動く。必ず **絶対パス** を args に渡す
- **MDX の slug = ファイル名**: `getPost(slug, lang)` が `<slug>.mdx` を見るので、ファイル名と frontmatter `slug` を一致させること
- **既存記事の上書き防止**: existing-slugs.json に同 slug があれば generator が自動で派生 slug を作る。万一 generator が無視して上書きしようとしたら親がガード:
  ```bash
  [ -f "${JA_MDX}" ] || [ "$ITER" -ge 2 ] && proceed
  ```
- **wrangler R2 未認証**: `wrangler whoami` で確認し、未ログインなら親がユーザーに報告して停止
- **画像生成失敗**: figure が 1 枚も生成されなかった場合、MDX 内の `<Figure src=...>` が 404 になる。**MDX を保存する前に画像生成完了を確認** するか、画像生成失敗時は MDX から該当 `<Figure>` を削除する後処理を入れる
- **3 周で 90 点未達**: 親は失敗報告だけ出して停止。**手動介入のために MDX と feedback.md を残しておく** (削除しない)
- **3 周ループの厳守 (subagent モード)**: parallel batch で起動した subagent は **必ず 3 周で打ち切る**。過去に subagent が 6 周回って evaluator を 4 回余計に呼んだ事故あり (2026-05-27)。3 周で 90 点未達なら subagent も親も諦めて手動レビューに渡す
- **Codex fact-check の間引き (2026-05-27)**: evaluator は iter1 と「暫定 overall ≥ 90 の合格候補」のみ Codex 委譲を実行。中間 iter (2〜N-1 で暫定 <90) は前回 `fact_checks` JSON を流用 + grep 軽量チェックで済ませる。run 親は `previous_eval_path` を context JSON に渡すこと
- **画像生成枚数 (2026-05-27)**: cover / og / figure 共に `--n 2` を標準とする。`--n 4` は記事の主軸画像 (pillar 記事の比較図など) のみ
- **next-sitemap への影響**: 記事追加後の URL は `npm run build && npm run postbuild` で sitemap に自動反映される
- **記事の `updated` フィールド**: 再生成時は `updated: ` を当日日付に更新する (generator が自動)

## 並列バッチ運用 (複数記事を 1 セッションで並列生成)

複数記事を生成したい場合は、**親 (このスキルを呼び出した Claude) が各記事を Agent ツールで subagent として並列起動** する。

### Input 形式

`$ARGUMENTS` に複数行 (改行区切り) または `topic-queue.txt` のパスを渡す:

```
$ARGUMENTS = "nextengine 楽天連携の運用Tips
nextengine Shopify連携セットアップ
brightdata SERP APIの実装"
```

または:

```
$ARGUMENTS = "@/abs/path/to/topic-queue.txt"
```

引数が 1 行 (改行なし) の場合は **単発モード** (上記 Step 0〜10) で動作。複数行の場合は **並列モード** に切り替える。

### Step P0: 共有スナップショット作成 (1 回だけ)

並列起動 **前** に、既存 slug・タイトル等を 1 回だけ抽出して各 subagent が共有する snapshot を作る。逐次更新による slug 衝突を防ぐ:

```bash
REPO="${SMILE_COMFORT_REPO:-$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")}"
BATCH_TS="$(date +%s)"
BATCH_DIR="${REPO}/output/_batch-${BATCH_TS}"
mkdir -p "${BATCH_DIR}"

# Step 1 と同じスクリプトで existing-slugs.json / titles.json / records.json を BATCH_DIR に書き出す
# (上記 Step 1 の node スクリプトを BATCH_DIR を WORKDIR として渡して実行)
node - <<'NODE' "${REPO}" "${BATCH_DIR}"
const fs = require("fs"), path = require("path");
const [repo, work] = process.argv.slice(2);
const matter = require("gray-matter");
const dirs = ["ja", "en"];
const all = { slugs: [], titles_ja: [], titles_en: [], records: [] };
for (const lang of dirs) {
  const d = path.join(repo, "src/lib/content", lang, "media");
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".mdx")) continue;
    const src = fs.readFileSync(path.join(d, f), "utf8");
    const { data } = matter(src);
    const slug = f.replace(/\.mdx$/, "");
    if (!all.slugs.includes(slug)) all.slugs.push(slug);
    if (lang === "ja" && data.title) all.titles_ja.push(data.title);
    if (lang === "en" && data.title) all.titles_en.push(data.title);
    all.records.push({ slug, lang, title: data.title, tags: data.tags ?? [], product: data.product ?? null });
  }
}
fs.writeFileSync(path.join(work, "existing-slugs.json"), JSON.stringify(all.slugs, null, 2));
fs.writeFileSync(path.join(work, "existing-titles.json"), JSON.stringify({ ja: all.titles_ja, en: all.titles_en }, null, 2));
fs.writeFileSync(path.join(work, "existing-records.json"), JSON.stringify(all.records, null, 2));
console.log(`snapshot: ${all.slugs.length} slugs`);
NODE
```

### Step P1: 予約 slug を確定 (slug 衝突回避)

各 topic ごとに **subagent 起動前に親が slug を予約** する。これで並列実行でも slug 衝突しない。各 topic に対して仮 slug を生成し、`existing-slugs.json` に追記しながら一意化:

```bash
# topic-queue.txt から行を読みながら、各 topic に予約 slug を割り当て
RESERVED_FILE="${BATCH_DIR}/reserved.tsv"
: > "$RESERVED_FILE"
EXISTING="${BATCH_DIR}/existing-slugs.json"

# topic 1 行ずつ処理
while IFS= read -r line; do
  [ -z "$line" ] && continue
  product="$(echo "$line" | awk '{print $1}')"
  topic="$(echo "$line" | cut -d' ' -f2-)"

  # 仮 slug を生成 (英数字+ハイフン)
  base_slug="$(echo "$topic" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9一-龯ぁ-んァ-ヶ]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//' | cut -c1-50)"
  reserved="${product}-${base_slug}"

  # 既存 + 既予約と衝突しないか確認、衝突したら suffix を付与
  suffix=""
  candidate="$reserved"
  while jq -e --arg s "$candidate" 'index($s)' "$EXISTING" > /dev/null 2>&1 || \
        awk -F'\t' -v s="$candidate" '$2 == s { exit 1 }' "$RESERVED_FILE"; do
    suffix=$((${suffix:-1} + 1))
    candidate="${reserved}-${suffix}"
  done

  printf "%s\t%s\t%s\n" "$product" "$candidate" "$topic" >> "$RESERVED_FILE"
done < <(printf "%s\n" "$ARGUMENTS")

cat "$RESERVED_FILE"
```

### Step P2: 各 topic を subagent で並列起動

`Agent` ツールを **複数同時 fire** する。1 メッセージ内で複数 `Agent` 呼び出しを書けば並列実行される:

```
For each line in $RESERVED_FILE:
  product, slug, topic = line.split("\t")

  Agent(
    description: "Generate <product> article: <slug>",
    subagent_type: "general-purpose",
    prompt: """
      You are an assistant that runs the run-affiliate-article skill for one article.

      INPUT:
      - product: <product>
      - topic:   <topic>
      - reserved_slug: <slug>          # MUST USE THIS SLUG, do not regenerate
      - shared_snapshot_dir: <BATCH_DIR>  # existing-slugs.json / titles.json / records.json はここを参照

      TASK:
      1. Skill: run-affiliate-article で単発モードのフローを実行 (Step 0〜Step 10)
      2. ただし以下に従う:
         - SLUG は reserved_slug を使う (slug 再生成しない)
         - existing-slugs.json は shared_snapshot_dir のものを使う (新規抽出しない)
         - WORKDIR は ${shared_snapshot_dir}/${slug}/ の下に作る
      3. 完了後、metadata.json と eval-iter*.json のパスを返答する

      OUTPUT:
      - 標準的な run-affiliate-article 完了報告 (Step 10 のフォーマット) を出力
      - 最後の 1 行に `BATCH_RESULT:<slug>:<score>:<passed>` のサマリを書く
    """,
    run_in_background: false  // 親は subagent の完了を待つ
  )
```

**重要**: 同一メッセージ内で複数 `Agent` ツールを呼び出すと並列起動される。subagent の数は **同時 5 個まで** (Codex の image_gen を含めて API レート制限を考慮)。5 個以上 topic がある場合はバッチを分けて順次実行。

### Step P3: 結果集約

全 subagent の完了報告から `BATCH_RESULT:<slug>:<score>:<passed>` をパースしてサマリを作る:

```bash
RESULTS_FILE="${BATCH_DIR}/batch-results.tsv"
: > "$RESULTS_FILE"
# 各 subagent の最終応答から BATCH_RESULT: 行を抽出 (Claude 親が応答テキストを直接読む)
# 親が手動で集計し ${BATCH_DIR}/batch-results.tsv に書く

echo "=== Batch summary ==="
column -t -s$'\t' "$RESULTS_FILE"
```

### Step P4: 完了報告 (バッチ)

```
## バッチ生成完了

- batch dir: ${BATCH_DIR}
- 件数: 3 / 3 成功 (or "2 / 3 成功 - 1 件は要レビュー")

### 個別結果
| slug | product | score | passed | mdx |
|---|---|---|---|---|
| nextengine-rakuten-...    | nextengine | 96 | ✓ | src/lib/content/ja/media/... |
| nextengine-shopify-...    | nextengine | 88 | ✗ | src/lib/content/ja/media/... |
| brightdata-serp-...       | brightdata | 92 | ✓ | src/lib/content/ja/media/... |

### 確認手順
1. npm run dev で http://localhost:3000/media/<slug> を全件確認
2. 不合格 (passed=false) の記事は ${BATCH_DIR}/<slug>/eval-iter*-feedback.md を参照
```

### 並列モードの制約

- **同時 subagent 数の上限**: 5 個 (API レート + image_gen レート)。それ以上はバッチ分け
- **wrangler R2 アップロードは並列 OK**: バケット名 + path で衝突しないため
- **slug は P1 で予約済み**: 各 subagent は予約 slug を必ず使う。再生成すると衝突する
- **共有 snapshot は read-only**: 各 subagent は `existing-slugs.json` を書き換えない (read のみ)
- **MDX 書き出しは subagent 終盤**: 並列 5 個でも file system 書き出しは異なる path (slug ごと) なので衝突しない
- **失敗した subagent は親が再 fire**: 1 件失敗してもバッチ全体は続行、最終報告で要レビューを明示
