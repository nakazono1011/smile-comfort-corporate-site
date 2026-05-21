---
name: assign-affiliate-article-evaluator
description: run-affiliate-article から呼ばれるアフィリエイト記事の採点専用 evaluator。直接呼ばれることは想定しない (internal)。
user-invocable: false
context: fork
agent: general-purpose
model: haiku
pair: assign-affiliate-article-generator
---

# assign-affiliate-article-evaluator

`assign-affiliate-article-generator` が生成した ja/en の MDX 記事を、`ref-affiliate-article` のルーブリックに基づき 7 軸 100 点満点で採点する evaluator。90 点未満なら修正指示を `feedback.md` に書き出す。MDX/JSON を直接修正しない。修正は generator が担当する。

**Prerequisites**: なし (Read のみ)。

## コンテキスト (スキル読み込み時に自動展開)

```json
!`cat $ARGUMENTS`
```

上記が空でなければ手順を最後まで実行する。「タスクが無い」と判断して空応答しない。

## 契約

`$ARGUMENTS` = **context JSON ファイルのパス** (絶対パス推奨)。

### context JSON スキーマ

```json
{
  "project_dir": "/abs/path/to/output/<slug>",
  "name": "<slug>",
  "ja_mdx_path": "/abs/path/to/src/lib/content/ja/media/<slug>.mdx",
  "en_mdx_path": "/abs/path/to/src/lib/content/en/media/<slug>.mdx",
  "metadata_json_path": "/abs/path/to/output/<slug>/metadata.json",
  "existing_slugs_path": "/abs/path/to/output/<slug>/existing-slugs.json",
  "existing_titles_path": "/abs/path/to/output/<slug>/existing-titles.json",
  "x_search_results_path": "/abs/path/to/output/<slug>/x-search.json",
  "iteration": 1,
  "output_contract": {
    "eval_file": "/abs/path/to/output/<slug>/eval-iter-1.json",
    "feedback_file": "/abs/path/to/output/<slug>/eval-iter-1-feedback.md",
    "schema": "/abs/path/to/.claude/skills/assign-affiliate-article-evaluator/eval-schema.json",
    "ref": "/abs/path/to/.claude/skills/ref-affiliate-article/SKILL.md"
  }
}
```

| キー | 必須 | 用途 |
|---|---|---|
| `ja_mdx_path` | ✓ | 採点対象 ja MDX |
| `en_mdx_path` | ✓ | 採点対象 en MDX |
| `metadata_json_path` | ✓ | generator が出力した metadata (image briefs, x_post_ids 等) |
| `existing_slugs_path` | ✓ | 既存記事 slug 一覧 (重複検知用) |
| `existing_titles_path` | ✓ | 既存記事 title 一覧 (3-gram 類似度判定用) |
| `x_search_results_path` | — | X 検索結果。X 埋め込み妥当性判定で参照 |
| `iteration` | ✓ | 現在のループ回数 |
| `output_contract.eval_file` | ✓ | 採点結果 JSON 出力先 |
| `output_contract.feedback_file` | ✓ | 90 点未満時のフィードバック markdown 出力先 |
| `output_contract.schema` | ✓ | eval-schema.json のパス |
| `output_contract.ref` | ✓ | ref-affiliate-article SKILL.md のパス |

---

## 手順

### 1. 前提情報読み込み

以下を順に Read:

1. `output_contract.schema` (eval-schema.json) — 7 軸の weight / threshold
2. `output_contract.ref` (ref-affiliate-article SKILL.md) — ルーブリック詳細
3. `ja_mdx_path`, `en_mdx_path` — 採点対象
4. `metadata_json_path` — generator メタ
5. `existing_slugs_path`, `existing_titles_path` — 重複判定用
6. `x_search_results_path` (オプション) — X 引用妥当性判定用

### 2. 採点 (8 軸)

`ref-affiliate-article §3` に記載されたルーブリックに従って ja/en の両方を読み、各キーを満点 × weight で採点する。配分:

| key | weight | threshold (合格最低) | 重み根拠 |
|---|---|---|---|
| `seo` | 20 | 14 | SEO は最重要 |
| `readability` | 15 | 11 | 読みにくい記事はコンバートしない |
| `affiliate_fit` | 15 | 11 | 誇張・disclosure 等の規約遵守 |
| `x_embed` | 10 | 7 | 一次情報引用としての価値 |
| `product_pitch` | 15 | 11 | 弊社支援文言の有無も含む |
| `duplication` | 15 | 11 | 既存記事と重複しない |
| `ja_en_parity` | 10 | 7 | 同時公開記事の整合 |
| `link_health` | 10 | 8 | リンク切れ・脚注 URL 無効はサイト品質を直接損なう |

**満点は 110**。`quality.overall = (sum / 110) * 100` で正規化、`overall >= 90` で合格 (eval-schema.json の `passing_rule`)。各キーは独立して採点、weight が満点、threshold は「そのキー単独でも合格に近い水準」。

#### 採点で必ず実施

- ja の title が既存 titles と 3-gram で何個一致するか機械的に数える (`duplication`)
- ja/en の H2 個数と意味的整合の比較 (`ja_en_parity`)
- `<TweetCard id="..." />` の数を grep して 1-3 個か確認 (`x_embed`)
- `<InlineCTA ... />` の数を grep して 2-3 個か確認 (`affiliate_fit`)
- 弊社支援文言 (Next Engine / Bright Data 限定) の存在チェック (`product_pitch`)
- 禁止語 (絶対 / 100% / 必ず / 万能 / 最強 / 神 / 永久) の grep (`affiliate_fit`)
- `※情報は YYYY-MM-DD 時点` の有無 (`affiliate_fit`)
- **`link_health`: MDX 内の全外部リンクを HTTP HEAD で検証** (詳細手順は §2.5)

### 2.5 link_health の検証手順

MDX 内のすべての外部リンクを抽出し、HTTP HEAD で 2xx 応答を返すか確認する。

#### a. リンク抽出

```bash
JA="${ja_mdx_path}"
EN="${en_mdx_path}"
WORKDIR="$(dirname "${output_contract.eval_file}")"
LINKS_FILE="${WORKDIR}/links-iter${iteration}.txt"

# Markdown [text](url) と <a href="url"> と frontmatter cover/heroImage/ogImage と
# <Figure src="url" /> / <TweetCard /> 用 oEmbed URL を抽出
{
  grep -oE 'https?://[^)" ]+' "$JA" "$EN" | awk -F: '{ for (i=2;i<=NF;i++) printf "%s%s", $i, (i<NF?":":"\n") }'
} | sed 's/[).,;:]*$//' | sort -u > "$LINKS_FILE"

LINK_COUNT="$(wc -l < "$LINKS_FILE")"
echo "Extracted ${LINK_COUNT} unique URLs"
```

#### b. HEAD 検証 (並列)

`curl -sI -L --max-time 10 -o /dev/null -w "%{http_code} %{url_effective}\n"` で全リンクの最終ステータスを取得。並列実行で 10-20 倍速。

```bash
RESULTS="${WORKDIR}/link-results-iter${iteration}.tsv"
: > "$RESULTS"

# xargs で並列 10
xargs -I {} -P 10 -a "$LINKS_FILE" sh -c '
  url="$1"
  # HEAD で 405/404 が返るサイトもあるので、HEAD で 405/4xx だったら GET にフォールバック
  code="$(curl -sI -L --max-time 10 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo 000)"
  if [ "$code" = "405" ] || [ "$code" = "403" ] || [ "$code" = "000" ]; then
    code="$(curl -s -L --max-time 10 -A "Mozilla/5.0 (compatible; LinkChecker)" -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo 000)"
  fi
  printf "%s\t%s\n" "$code" "$url"
' _ {} >> "$RESULTS"

# 結果集計
BROKEN="$(awk -F'\t' '$1 !~ /^2/ { print }' "$RESULTS")"
BROKEN_COUNT="$(printf "%s" "$BROKEN" | grep -c . || echo 0)"
echo "Broken links: ${BROKEN_COUNT} / ${LINK_COUNT}"
```

> **Note**: アフィリエイトリンク (例: `https://get.brightdata.com/...` `https://base.next-engine.org/account/?agent_code=...`) は 302 リダイレクトを多く返すので、`-L` (follow redirect) を必ず付ける。最終 URL が 2xx なら合格扱い。
>
> **SPA / JS リダイレクト**: HEAD/GET で 200 を返すが本文が「Page not found」の JS SPA は検出できない。これは Playwright (chrome-devtools MCP) で別途確認するが、evaluator では HEAD ベースの判定に留め、致命的に怪しいリンクは feedback で「Playwright で要追加確認」と書き出す。

#### c. スコアリング (weight 10)

| 状態 | スコア控除 |
|---|---|
| 全 URL が 2xx | -0 (満点 10) |
| 4xx / 5xx (致命) リンク 1 件 | -3 |
| 4xx / 5xx リンク 2-3 件 | -6 (threshold 割れ→不合格扱い) |
| 4xx / 5xx リンク 4 件以上 | -10 (0 点) |
| 3xx で最終応答が 2xx でない (チェーン破綻) | 1 件あたり -2 |
| URL に typo っぽい異常 (例: `http://` で始まる非 HTTPS) | -1 / 件 |

致命的に壊れたリンクが 2 件以上 → `link_health.score < threshold` で **その回は不合格扱い** (overall が 90 を超えても retry させる)。

#### d. eval JSON への記録

eval JSON の breakdown 配下に `link_health` を追加し、別途 `link_checks` フィールドに raw データを残す:

```json
{
  "breakdown": {
    "...": "...",
    "link_health": {
      "score": 7,
      "max": 10,
      "notes": "broken: 2件 (https://example.com/old → 404, https://foo.bar → DNS fail)"
    }
  },
  "link_checks": {
    "total": 18,
    "ok": 16,
    "broken": 2,
    "results": [
      { "url": "https://get.brightdata.com/0cqcj8xp08fo", "status": 200, "final_url": "https://brightdata.com/?ref=..." },
      { "url": "https://example.com/old", "status": 404, "final_url": "https://example.com/old" }
    ]
  }
}
```

`link_checks.results` は **致命的に壊れたリンクのみ** を抜粋して書く (全件は `${WORKDIR}/link-results-iter${N}.tsv` に raw 保存)。

### 3. JSON 出力

`output_contract.eval_file` に以下の JSON を書き出す:

```json
{
  "skill": "assign-affiliate-article-evaluator",
  "version": "1",
  "iteration": 1,
  "evaluator_skill": "assign-affiliate-article-evaluator",
  "model": "haiku",
  "subject": {
    "slug": "<slug>",
    "ja_mdx_path": "...",
    "en_mdx_path": "..."
  },
  "breakdown": {
    "seo":           { "score": 18, "max": 20, "notes": "..." },
    "readability":   { "score": 13, "max": 15, "notes": "..." },
    "affiliate_fit": { "score": 14, "max": 15, "notes": "..." },
    "x_embed":       { "score":  9, "max": 10, "notes": "..." },
    "product_pitch": { "score": 13, "max": 15, "notes": "..." },
    "duplication":   { "score": 14, "max": 15, "notes": "..." },
    "ja_en_parity":  { "score":  9, "max": 10, "notes": "..." },
    "link_health":   { "score":  9, "max": 10, "notes": "broken: 1件 (脚注 [^3])" }
  },
  "link_checks": {
    "total": 18,
    "ok": 17,
    "broken": 1,
    "results": [
      { "url": "https://example.com/old-spec", "status": 404, "final_url": "https://example.com/old-spec" }
    ]
  },
  "quality": {
    "overall": 90
  },
  "passed": true,
  "feedback": null
}
```

`feedback` は合格時 `null`、不合格時は feedback.md の絶対パス。`quality.overall` は `(sum_of_scores / 110) * 100` で算出 (eval-schema.json の `passing_rule`)。

### 4. フィードバック出力 (90 点未満時のみ)

`output_contract.feedback_file` に修正指示を書き出す。

```markdown
# Affiliate Article Review Feedback

iteration: {N}
timestamp: {YYYY-MM-DDTHH:MM:SSZ}
overall_score: {X}/100

## Breakdown

| 軸 | 点 | 満点 |
|---|---|---|
| seo | 18 | 20 |
| readability | 13 | 15 |
| affiliate_fit | 8 | 15 |
| ...

## High priority (致命的、必ず修正)

- [seo] H2 が 7 個ある (推奨 3-6)。H2-4 と H2-5 を 1 つに統合 → "## ... " と "## ..." を結合
- [affiliate_fit] InlineCTA が末尾に 2 個まとめてある。1 個を H2-3 直前 (本文 30〜50% 地点) に移動
- ...

## Medium priority

- [product_pitch] 弊社の Next Engine 導入支援文言がない。リード文または H2-2 のどこかに「弊社は Next Engine の導入支援実績があり、初期セットアップから運用設計まで伴走可能です」と 1 文追加
- ...

## Low priority

- [readability] H2-3 のセクション本文が 1100 字あり、H3 で 2 サブセクションに分割推奨
- ...

## ja/en parity issues

- en で H2 が 5 個、ja で 4 個。en の "## Tips for advanced users" を削除し ja に合わせる、または ja に "## 上級者向けTips" を追加
- ...

## broken links (link_health)

- [link_health] ja MDX 内 `[公式仕様](https://example.com/old-spec)` が 404。最新 URL `https://example.com/spec-v2` に差替を generator に指示
- [link_health] en MDX の脚注 `[^3]: https://foo.bar/...` が DNS fail。リンク削除 or アーカイブ URL (`https://web.archive.org/web/...`) に差替
- ...
```

`link_checks.tsv` (raw 結果) は `${WORKDIR}/link-results-iter${N}.tsv` に保存済み。generator 側は feedback.md の指示を受けて MDX 内 URL を差し替える。

### 5. 完了報告

```
## アフィリエイト記事レビュー完了

- 入力: {ja_mdx_path} + {en_mdx_path}
- 採点: {output_contract.eval_file}
- フィードバック: {output_contract.feedback_file or "なし（合格）"}
- 最終スコア: {X}/100 (合格基準 90)
- ループ回数: {iteration}

### 軸別

| 軸 | 点 / 満点 | 合否 |
|---|---|---|
| seo | 18/20 | ✓ |
| readability | 13/15 | ✓ |
| affiliate_fit | 8/15 | ✗ |
| ...
```

---

## Gotchas

- **Read だけ使う**。Edit/Write は eval_file と feedback_file のみ。記事 MDX は決して編集しない
- **採点はモデルが自分でやる**。`bash` でテキスト解析するのは grep の数え上げ程度
- **重複判定**: `existing_titles_path` の JSON 配列を `existing_titles.json[]` として読み、各既存 title と新規 title の 3-gram (連続 3 文字) を抽出して set-intersection を計算。共通要素数 / 新規 title 3-gram 数 = 類似度。0.6 以上で減点
- **Haiku モデル**: 軽量モデルなので、Read する MDX 全文を一度に処理する。複雑なヒューリスティックは ref-affiliate-article §3 のチェックリストで補強
- **ja/en parity**: 段落数の同一性ではなく **意味のセクション数** で判定。en は ja の 0.4〜0.7 倍の文字数で済むのが標準
