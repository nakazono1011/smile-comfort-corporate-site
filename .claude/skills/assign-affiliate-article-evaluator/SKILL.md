---
name: assign-affiliate-article-evaluator
description: run-affiliate-article から呼ばれるアフィリエイト記事の採点専用 evaluator。直接呼ばれることは想定しない (internal)。
user-invocable: false
context: fork
agent: general-purpose
model: opus
pair: assign-affiliate-article-generator
---

# assign-affiliate-article-evaluator

`assign-affiliate-article-generator` が生成した ja/en の MDX 記事を、`ref-affiliate-article` のルーブリックに基づき **11 軸 145 点満点** で採点する evaluator。正規化後 90 点未満なら修正指示を `feedback.md` に書き出す。MDX/JSON を直接修正しない。修正は generator が担当する。

**v3 (2026-07) の変更点**:
- `intent_fit` (weight 10) と `cv_readiness` (weight 10) を新規追加。満点 125 → **145**、`passing_rule = (score / 145) * 100 >= 90`。
- `intent_fit`: 記事の検索意図タイプ (ref §4.1) の必須ブロック充足 + `serp-brief.json` の論点カバー。`cv_readiness`: 向き不向き・不安解消・意思決定要素・CTA 検討段階整合。
- `link_health`: **AF リンク (`affiliate.ts` の `AFFILIATE_LINK_HOSTS`) を curl 対象から除外**し、config との文字列一致に置換 (クリック計測を汚さない)。
- `ja_en_parity`: 直訳一致を要求せず、数値・URL・固有名詞の一致のみ必須 (en の独自構成を許容)。nextengine の ja 単独記事は本軸を満点固定 (N/A)。
- title / summary の**文字数を機械カウント**して `seo` に反映。

**v2 (2026-05-23) の変更点**:
- `factual_accuracy` 軸を新規追加 (weight 15、threshold 11)。公式 URL の本文を取得して数値・固有情報を突合する。
- 事実関係チェックは **`delegate-codex` 経由で Codex CLI に委譲** する (推論能力の必要な fact-check のため、Haiku から Opus + Codex 構造へ移譲)。Haiku で済む grep ベースの軸はそのまま親の Opus で処理。
- 過去の不合格パターン (Next Engine 月額の捏造 / 1Password 月払い・年払いの混同 / X 引用文の捏造) を防ぐため、`fact_checks` フィールドを eval JSON に必ず含める。

**Prerequisites**:
- `codex` CLI が PATH にあり、`delegate-codex` 経由で呼び出せること。未インストールの場合は Codex 移譲をスキップしてフラグだけ記録する。

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
  "previous_eval_path": "/abs/path/to/output/<slug>/eval-iter-<N-1>.json",
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
| `previous_eval_path` | — | 前回 iter の eval JSON (iter≥2 のみ)。Codex 委譲の間引き判定で参照 |
| `output_contract.eval_file` | ✓ | 採点結果 JSON 出力先 |
| `output_contract.feedback_file` | ✓ | 90 点未満時のフィードバック markdown 出力先 |
| `output_contract.schema` | ✓ | eval-schema.json のパス |
| `output_contract.ref` | ✓ | ref-affiliate-article SKILL.md のパス |

---

## 手順

### 1. 前提情報読み込み

以下を順に Read:

1. `output_contract.schema` (eval-schema.json) — 11 軸の weight / threshold
2. `output_contract.ref` (ref-affiliate-article SKILL.md) — ルーブリック詳細
3. `ja_mdx_path`, `en_mdx_path` — 採点対象
4. `metadata_json_path` — generator メタ
5. `existing_slugs_path`, `existing_titles_path` — 重複判定用
6. `x_search_results_path` (オプション) — X 引用妥当性判定用

### 2. 採点 (11 軸)

`ref-affiliate-article §3` に記載されたルーブリックに従って ja/en の両方を読み、各キーを満点 × weight で採点する。配分:

| key | weight | threshold (合格最低) | 重み根拠 | 採点主体 |
|---|---|---|---|---|
| `seo` | 20 | 14 | SEO は最重要。title/summary 字数も機械カウント | 親 (Opus) |
| `readability` | 15 | 11 | 読みにくい記事はコンバートしない | 親 (Opus) |
| `intent_fit` | 10 | 7 | 検索意図別の必須ブロック + SERP ブリーフ論点カバー | 親 (Opus) |
| `cv_readiness` | 10 | 7 | 向き不向き・不安解消・意思決定要素・CTA 検討段階整合 | 親 (Opus) |
| `affiliate_fit` | 15 | 11 | CTA 基準表適合・誇張・disclosure・author 等の規約遵守 | 親 (Opus) |
| `factual_accuracy` | 15 | 11 | **数値・固有情報の正確性 (公式 URL 突合)。捏造を 1 件でも検出したら 0 点扱い** | **Codex (delegate-codex)** |
| `x_embed` | 10 | 7 | 一次情報引用としての価値 | 親 (Opus) |
| `product_pitch` | 15 | 11 | USP・競合差・弊社支援文言の有無 | 親 (Opus) |
| `duplication` | 15 | 11 | 既存記事と重複しない | 親 (Opus) |
| `ja_en_parity` | 10 | 7 | 数値・URL・固有名詞の一致 (直訳一致は不要。ja 単独記事は N/A 満点) | 親 (Opus) |
| `link_health` | 10 | 8 | リンク切れ・脚注 URL 無効はサイト品質を直接損なう。**AF リンクは除外** | 親 (Bash, HTTP HEAD) |

**満点は 145**。`quality.overall = (sum / 145) * 100` で正規化、`overall >= 90` で合格 (eval-schema.json の `passing_rule`)。各キーは独立して採点、weight が満点、threshold は「そのキー単独でも合格に近い水準」。`intent_fit` / `cv_readiness` の採点基準は ref-affiliate-article §3.10 / §3.11 と §4 を参照。

#### 採点で必ず実施

- **title / summary の文字数を機械カウント** (`seo`): title ja ≤ 40 字目安 / en ≤ 60 char、summary ja ≤ 120 字 / en ≤ 155 char。主要 KW が title 前方にあるか、`slug` に年号が焼き込まれていないか
- ja の title が既存 titles と 3-gram で何個一致するか機械的に数える (`duplication`)
- ja/en の数値・URL・固有名詞の一致確認 (`ja_en_parity`)。**直訳一致・H2 数一致は要求しない**。nextengine の ja 単独記事は本軸を満点固定にして `notes` に `"ja-only (nextengine): parity N/A"`
- `<TweetCard id="..." />` の数を grep して 1-3 個か確認 (`x_embed`)
- `<InlineCTA ... />` の数と種別を grep し、**ref §7 の product 別 CTA 基準表**に適合するか確認 (`affiliate_fit`)。同一 intent の重複 (primary 2 個等) は減点
- **`intent_fit`**: metadata.json の `category` から intent を判定 (ref §4.1) し、その intent の必須ブロック (料金シミュ / 比較決定表 / 手順チェックリスト等、ref §4.2) が本文に存在するか確認。`serp-brief.json` があれば上位見出し論点のカバー率も見る
- **`cv_readiness`**: 「向いている人／向いていない人」の有無、不安解消要素 (解約・返金・無料期間・日本語対応・データ移行) が 2 つ以上あるか、意思決定を助ける具体要素 (料金シミュ / 比較表 / 導入工数 / ROI 目安) があるかを確認
- **本文中の AF 製品名インラインリンクの数を grep して 3〜5 個か確認** (`affiliate_fit`)。`product` 別の AF URL マップ:
  - `brightdata` → `https://get.brightdata.com/0cqcj8xp08fo` (単一)
  - `nextengine` → `https://base.next-engine.org/account/?agent_code=MzEzNw` (単一)
  - `1password` → 3 URL のいずれか / 組合せ (記事カテゴリに応じて使い分け):
    - 汎用 / デフォルト: `https://1password.partnerlinks.io/sc-link`
    - Business 専用 (ビジネス特化記事のみ): `https://1password.partnerlinks.io/dobcflhz59kl-d8wpd`
    - 乗り換え促進 (移行文脈のみ): `https://1password.partnerlinks.io/6dieu4x28dzi-gp0g2q`
  - 検査コマンド (ja/en それぞれ): `grep -cE '\[[^]]+\]\(<AF_URL>\)' "$JA_MDX"` を **各 AF URL で実行して合算**。`<InlineCTA />` 内 (HTML 属性) はカウント対象外なので、Markdown リンク記法 `[text](url)` のみカウント
  - 期待値: 3〜5 (ja/en それぞれ、合算カウント)。0〜2 個・6 個以上は減点対象 (ref-affiliate-article §3.3 / §7.5)
  - **1password の必須チェック**:
    - 記事全体に **最低 1 箇所** は汎用 URL (`sc-link`) が含まれること。0 箇所は主導線が外れているので `-2` 減点
    - Business 専用 URL (`dobcflhz59kl-d8wpd`) は、tags/topic に Business / Teams / Enterprise / SSO / SCIM / Secrets Automation / 法人導入 / チーム運用 のいずれかを含む **ビジネス特化記事のみ** で使用可。それ以外で使用していたら誤用として `-2` 減点
    - 乗り換え URL (`6dieu4x28dzi-gp0g2q`) は、タイトル/H2 に「乗り換え」「移行」「from Bitwarden」「LastPass 代替」などを含む **乗り換え/移行記事のみ** で使用可。それ以外で使用していたら誤用として `-2` 減点
    - 1 記事内で 3 URL すべてを使い分けていたら過剰として `-1` 減点 (多くて 2 種類)
  - 競合製品 (Smartproxy / Apify / Bitwarden / CROSS MALL 等) に AF URL を貼っていたら誤用として `-3` 減点
- 弊社支援文言 (Next Engine / Bright Data 限定) の存在チェック (`product_pitch`)
- 禁止語 (絶対 / 100% / 必ず / 万能 / 最強 / 神 / 永久) の grep (`affiliate_fit`)
- **frontmatter `author` が `smile-comfort` か確認** (ja/en 両方)。個人 ID (`kei-nakazono` など) を検出したら `affiliate_fit` で `-3` 減点 (致命傷)。grep コマンド: `grep -E '^author:' "$JA_MDX" "$EN_MDX"` の結果がすべて `"smile-comfort"` であること
- `※情報は YYYY-MM-DD 時点` の有無 (`affiliate_fit`)
- **`link_health`: MDX 内の全外部リンクを HTTP HEAD で検証** (詳細手順は §2.5)

### 2.4 factual_accuracy の検証手順 (Codex 移譲・最重要軸)

**目的**: 過去に subagent が「Next Engine 月額 10,000 円」「1Password 年額 $47.88 (月払い基準を年払い表記)」のような捏造を入れ、Haiku 採点が見逃した事故を防ぐ。

**採点本体は `delegate-codex` 経由で Codex CLI に委譲する**。Codex は MDX 内の全数値・固有情報を抜き出し、公式 URL を WebFetch で取得して 1 件ずつ突合する。

#### 2.4.0 Codex 委譲の発火条件 (iteration ごと・2026-05-27 改訂)

Codex 委譲は **WebFetch を 5-10 回回す重い処理** (1 回 3-5 分) のため、**毎 iteration では実行しない**。以下のルールで間引く:

| iteration の状態 | Codex 委譲 | factual_accuracy スコアの算出 |
|---|---|---|
| **iter1 (初回)** | ✅ **必ず実行** | Codex の出力をそのまま採用 |
| **中間 iter (2 ≤ iter < 最終)** で暫定 overall < 90 | ❌ **スキップ** | **前回 iter の `fact_checks` JSON を流用** + 親 (Opus) が MDX の数値差分を grep で軽量チェック |
| **中間 iter** で暫定 overall ≥ 90 (= 合格候補) | ✅ **最終確認として 1 回実行** | Codex の最新出力で確定 |
| **3 周目の最終 iter** (リトライ上限) | ✅ 念のため実行 | Codex の出力を採用 |

**「前回 fact_checks の流用」の手順**:

1. context JSON の `previous_eval_path` (optional, run 親が渡す) から前回 eval JSON を Read
2. `previous.fact_checks.{verified, mismatches, unverified, fabricated}` をコピー
3. 親 (Opus) が ja_mdx / en_mdx を grep し、**価格・日付・パーセンテージ・通貨記号 ($ ¥) を含む行** を抜き出す
4. 抜き出した行と前回の `fact_checks.verified[].claim` を文字列比較。**新規追加 or 値変更されている数値が 3 件以上あれば** Codex 委譲を強制実行 (流用打ち切り)
5. 変更が 2 件以下なら前回値を維持。`fact_checks.notes` に `"reused from iter<N-1> (delta: <差分件数>件)"` を追記

**親 (Opus) の grep ベース軽量チェック**:

```bash
# 数値・通貨・%を含む行を抽出
grep -nE '(\$[0-9]|¥[0-9]|[0-9]+(\.[0-9]+)?%|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]+ 円|[0-9]+ 万)' "${JA_MDX}" > /tmp/curr-claims-ja.txt
grep -nE '(\$[0-9]|[0-9]+(\.[0-9]+)?%|[0-9]{4}-[0-9]{2}-[0-9]{2})' "${EN_MDX}" > /tmp/curr-claims-en.txt
# 前回 fact_checks の verified claim と diff
```

**メリット**: 6 周ループのうち Codex 委譲が 2 回 (iter1 + 合格候補確認) に減り、evaluator 全体の時間が **40-60% 短縮** される。中間 iter の factual_accuracy score は安定する (前回値流用) ため、修正中の数値変更がない限りスコアブレも起こさない。

**注意**: 数値・固有情報を **新規追加 / 変更した** iter は必ず Codex を回す。前回値流用で fabricated を見逃すと致命傷。


#### a. Codex へのタスク設計

親 (Opus) が以下の context JSON を組み立てて `delegate-codex` を呼ぶ:

```json
{
  "task": "<以下の prompt>",
  "project_dir": "<WORKDIR>",
  "mode": "read_only",
  "timeout_s": 900
}
```

prompt (Codex への指示):

```
You are auditing two MDX articles for factual accuracy. Your sole goal: find every numerical claim, brand-specific fact, or attributed quote that could be wrong, and verify each against the official primary source.

INPUTS:
- ja_mdx: <abs path>
- en_mdx: <abs path>
- product: <brightdata|nextengine|1password>
- x_search_path: <abs path to x-search.json from generator>

OFFICIAL SOURCES (you MUST WebFetch these and compare):
- brightdata: https://brightdata.com/pricing (and product subpages)
- nextengine: https://next-engine.net/price/
- 1password: https://1password.com/jp/pricing (and https://1password.com/pricing for USD)

TASK:
1. Extract every (price, fee, count, percentage, date, named entity) from ja_mdx + en_mdx.
2. WebFetch the official URL(s) above and pull the canonical values.
3. For each extracted item, classify:
   - "verified": matches official source within rounding
   - "mismatch": differs from official source (specify expected vs actual)
   - "unverified": no authoritative source confirms or denies
   - "fabricated": clearly invented (e.g. a campaign with no public record)
4. For each TweetCard id referenced in ja_mdx/en_mdx, verify it exists in x_search_path.inline_citations (if not, mark "fabricated").
5. Score the article on factual_accuracy (max 15):
   - All "verified" or "unverified-with-disclaimer" → 15
   - 1 "mismatch" → 10
   - 2+ "mismatch" → 5
   - Any "fabricated" → 0 (致命)
6. Write a fact-checks JSON to the path provided (see Output below) with the full breakdown.

OUTPUT (write to disk as JSON):
{
  "score": <0-15>,
  "verified": [{ "claim": "...", "official_url": "...", "official_value": "..." }],
  "mismatches": [{ "claim": "...", "actual": "...", "expected": "...", "official_url": "..." }],
  "unverified": [{ "claim": "...", "note": "no authoritative source found" }],
  "fabricated": [{ "claim": "...", "evidence": "no entry in x_search inline_citations" }],
  "notes": "..."
}
```

#### b. Codex 出力の取り込み

Codex が書き出した fact-checks JSON を親が Read し、`factual_accuracy.score` と `mismatches` / `fabricated` の件数を eval JSON に反映:

```json
{
  "breakdown": {
    "factual_accuracy": {
      "score": 10,
      "max": 15,
      "notes": "mismatch: 1件 (ja: 'Individual 年額 $47.88' → 公式: 月払い基準 $47.88 / 年払い基準 $35.88、年払いの場合を明示すべき)"
    }
  },
  "fact_checks": {
    "verified": [...],
    "mismatches": [...],
    "fabricated": [...]
  }
}
```

#### c. スコアリング (weight 15)

| 状態 | スコア |
|---|---|
| 全 claim が verified | 15 |
| unverified が 2 件以内、mismatch ゼロ | 13-14 |
| mismatch 1 件 | 10 |
| mismatch 2 件以上 | 5 (threshold 割れ→不合格) |
| fabricated 1 件以上 | 0 (致命・即不合格) |

**fabricated を 1 件でも検出した時点で `factual_accuracy.score = 0` かつ `passed = false`** を強制する (overall が 90 を超えても retry させる)。

#### d. Codex 未インストール時のフォールバック

`codex-delegate.sh` が `(Codex delegate skipped: codex CLI not installed)` を返した場合:
- 親 (Opus) が自前で公式 URL を WebFetch して数値突合を行う
- ただし精度は落ちるため、`fact_checks.notes` に `"Codex unavailable, scored by parent Opus (degraded mode)"` を残す
- フォールバック実装でも mismatch 検出をきちんと行う (Haiku では不可能だが Opus なら可能)

### 2.5 link_health の検証手順

MDX 内のすべての外部リンクを抽出し、HTTP HEAD で 2xx 応答を返すか確認する。

#### a. リンク抽出

```bash
JA="${ja_mdx_path}"
EN="${en_mdx_path}"
WORKDIR="$(dirname "${output_contract.eval_file}")"
LINKS_FILE="${WORKDIR}/links-iter${iteration}.txt"

# Markdown [text](url) と frontmatter cover/heroImage/ogImage と <Figure src="url" /> の URL を抽出。
# ただし AF リンク (affiliate.ts の AFFILIATE_LINK_HOSTS) は curl しない
# (クリック計測を汚さない / 302 チェーンの動的先で誤検知しないため)。
{
  grep -oE 'https?://[^)" ]+' "$JA" "$EN" | awk -F: '{ for (i=2;i<=NF;i++) printf "%s%s", $i, (i<NF?":":"\n") }'
} | sed 's/[).,;:]*$//' \
  | grep -vE 'get\.brightdata\.com|base\.next-engine\.org|1password\.partnerlinks\.io' \
  | sort -u > "$LINKS_FILE"

LINK_COUNT="$(wc -l < "$LINKS_FILE")"
echo "Extracted ${LINK_COUNT} unique non-affiliate URLs"
```

> **AF リンクの正当性は別途 `affiliate_fit` で検証**する。curl はせず、本文中の AF URL が `affiliate.ts` の正規 URL (`get.brightdata.com/0cqcj8xp08fo` / `base.next-engine.org/account/?agent_code=MzEzNw` / `1password.partnerlinks.io/{sc-link,dobcflhz59kl-d8wpd,6dieu4x28dzi-gp0g2q}`) と文字列一致するかだけを確認する。別 ID・別製品・公式サイト誤爆があれば `affiliate_fit` で減点。

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
  "version": "2",
  "iteration": 1,
  "evaluator_skill": "assign-affiliate-article-evaluator",
  "model": "opus+codex",
  "subject": {
    "slug": "<slug>",
    "ja_mdx_path": "...",
    "en_mdx_path": "..."
  },
  "breakdown": {
    "seo":              { "score": 18, "max": 20, "notes": "title 34字/KW前方 OK, summary 118字" },
    "readability":      { "score": 13, "max": 15, "notes": "..." },
    "intent_fit":       { "score":  9, "max": 10, "notes": "Transactional: 料金表+シミュ+隠れコスト有。SERP 上位論点 4/5 カバー" },
    "cv_readiness":     { "score":  8, "max": 10, "notes": "向き不向き有 / 不安解消 2 (無料期間・解約)" },
    "affiliate_fit":    { "score": 14, "max": 15, "notes": "CTA 基準表適合 (primary1+support1)" },
    "factual_accuracy": { "score": 13, "max": 15, "notes": "verified: 12件 / mismatch: 0 / fabricated: 0。Codex 評価済み" },
    "x_embed":          { "score":  9, "max": 10, "notes": "..." },
    "product_pitch":    { "score": 13, "max": 15, "notes": "..." },
    "duplication":      { "score": 14, "max": 15, "notes": "..." },
    "ja_en_parity":     { "score":  9, "max": 10, "notes": "数値/URL 一致。en は独自構成 (許容)" },
    "link_health":      { "score":  9, "max": 10, "notes": "broken: 1件 (脚注 [^3])。AF リンクは検証除外" }
  },
  "fact_checks": {
    "verified": [
      { "claim": "Next Engine 月額 3,000 円", "official_url": "https://next-engine.net/price/", "official_value": "3,000 円 (税抜)" }
    ],
    "mismatches": [],
    "unverified": [],
    "fabricated": []
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

`feedback` は合格時 `null`、不合格時は feedback.md の絶対パス。`quality.overall` は `(sum_of_scores / 145) * 100` で算出 (eval-schema.json の `passing_rule`)。`fact_checks.fabricated` が 1 件でもあれば `passed = false` を強制 (overall が 90 を超えても再生成させる)。

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
- [intent_fit] Transactional 記事なのに料金シミュレーションが無い。「受注 500 / 2,000 / 5,000 件時の月額」を表で追加
- [cv_readiness] 「向いている人／向いていない人」セクションが無い。まとめ手前に H3 で「向いているケース」「別ツールが向くケース (代替名)」を追加。不安解消 (無料期間・解約条件) を FAQ か本文に 2 点
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

- **Read だけ使う**。Edit/Write は eval_file と feedback_file と fact-checks JSON のみ。記事 MDX は決して編集しない
- **採点はモデルが自分でやる**。`bash` でテキスト解析するのは grep の数え上げ程度
- **factual_accuracy は Codex 移譲が原則**。Codex が未インストールの環境では親 (Opus) が WebFetch で代替するが、必ず `fact_checks.notes` に degraded mode を記録
- **fabricated 検出時の振る舞い**: overall が 90 を超えても `passed = false` を強制。記事の信頼性は他軸の高得点では取り戻せない (1 個でも嘘があれば公開不可)
- **重複判定**: `existing_titles_path` の JSON 配列を `existing_titles.json[]` として読み、各既存 title と新規 title の 3-gram (連続 3 文字) を抽出して set-intersection を計算。共通要素数 / 新規 title 3-gram 数 = 類似度。0.6 以上で減点
- **Opus + Codex の役割分担**: 構造・字数・grep ベースの軸は親の Opus が直接採点する。`factual_accuracy` のみ Codex に委譲する (推論能力と外部 WebFetch ループが必要)
- **ja/en parity**: 段落数の同一性ではなく **意味のセクション数** で判定。en は ja の 0.4〜0.7 倍の文字数で済むのが標準
