---
name: assign-affiliate-article-generator
description: 1Password / Bright Data / Next Engine アフィリエイト記事の ja/en MDX を設計・修正する内部スキル。run-affiliate-article から呼び出される (internal)。
user-invocable: false
context: fork
agent: general-purpose
model: opus
pair: assign-affiliate-article-evaluator
---

# assign-affiliate-article-generator

X 検索結果と既存記事メタと製品仕様を入力に、ja/en 両言語の MDX 記事を生成する。前回成果物と feedback がある場合は既存 MDX を修正する。create / fix のモード分岐は契約上持たず、入力 context に `feedback_path` が指定され且つ既存 MDX が存在するかで内部的に挙動を切り替える (assign-slide-generator と同じ流儀)。

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
  "product": "1password | brightdata | nextengine",
  "topic": "<人間が書いた topic 文>",
  "locales": ["ja", "en"],
  "x_search_results_path": "/abs/path/to/output/<slug>/x-search.json",
  "serp_brief_path": "/abs/path/to/output/<slug>/serp-brief.json",
  "existing_slugs_path": "/abs/path/to/output/<slug>/existing-slugs.json",
  "existing_titles_path": "/abs/path/to/output/<slug>/existing-titles.json",
  "unused_cells_path": "/abs/path/to/output/<slug>/unused-cells.json",
  "related_candidates_path": "/abs/path/to/output/<slug>/related-candidates.json",
  "subtopics_path": "/abs/path/to/.claude/skills/ref-affiliate-article/subtopics.json",
  "feedback_path": "/abs/path/to/output/<slug>/eval-iter-1-feedback.md",
  "previous_metadata_path": "/abs/path/to/output/<slug>/metadata.json",
  "iteration": 2,
  "output_contract": {
    "ja_mdx_path": "/abs/path/to/src/lib/content/ja/media/<slug>.mdx",
    "en_mdx_path": "/abs/path/to/src/lib/content/en/media/<slug>.mdx",
    "metadata_json_path": "/abs/path/to/output/<slug>/metadata.json",
    "ref_skill_md": "/abs/path/to/.claude/skills/ref-affiliate-article/SKILL.md",
    "voice_guide": "/abs/path/to/.claude/skills/assign-affiliate-article-generator/references/voice-guide.md",
    "product_ref": "/abs/path/to/.claude/skills/assign-affiliate-article-generator/references/product-<product>.md",
    "template": "/abs/path/to/.claude/skills/assign-affiliate-article-generator/references/article-template.mdx.tmpl"
  }
}
```

| キー | 必須 | 用途 |
|---|---|---|
| `product` | ✓ | `1password` `brightdata` `nextengine` の 3 値 |
| `topic` | ✓ | 人間が指定したサブトピック (例: 「楽天連携の運用Tips」) |
| `reserved_slug` | — | 親が確定した slug。**あれば再生成せず必ずこれを使う** (Step 2-0) |
| `locales` | ✓ | 標準は `["ja", "en"]` (両言語同時生成)。**nextengine は `["ja"]`** (en 市場が無いため ja 単独)。指定に従う |
| `x_search_results_path` | — | X 検索 JSON。あれば本文 X 埋め込み候補に使う |
| `serp_brief_path` | — | SERP リサーチ結果 (上位タイトル・見出し・PAA)。intent_fit 用に本文構成・FAQ へ反映 |
| `existing_slugs_path` | ✓ | 既存 slug 配列 (重複回避) |
| `existing_titles_path` | ✓ | 既存 title 配列 (3-gram 類似判定) |
| `unused_cells_path` | — | orchestrator が抽出した未使用 (product × category × slug_pattern) 候補。空配列 OK |
| `related_candidates_path` | — | 本文中に自然リンクで埋め込むべき既存記事候補。**最低 2 件本文挿入** が原則 (件数足りない時のみ免除) |
| `subtopics_path` | ✓ | サブトピック分類表 (`ref-affiliate-article/subtopics.json`) |
| `feedback_path` | — | レビュー指示 markdown。**存在すれば修正動作** |
| `previous_metadata_path` | — | 前回 metadata。修正動作で参照 |
| `iteration` | ✓ | 1 = 新規 / 2 以降 = 修正 |
| `output_contract.*` | ✓ | 出力先・参考 ref のパス |

### 動作分岐 (内部)

- `feedback_path` ファイルが存在 + 既存 ja_mdx/en_mdx が存在 → **修正動作**
- それ以外 → **新規設計動作**

呼び出し元はモード切替を意識しない。

---

## 新規設計動作

### Step 1. 前提読み込み

以下を順に Read:

1. `output_contract.ref_skill_md` (ref-affiliate-article SKILL.md) — 特に §3.10/§3.11/§4/§7
2. `output_contract.voice_guide` (voice-guide.md)
3. `output_contract.product_ref` (product-<product>.md) — 「一次データ・実運用エビデンス」節も読む
4. `output_contract.template` (基本雛形) と `references/templates/<intent>.mdx.tmpl` (§4.1 で判定した intent 別テンプレ)
5. `subtopics_path` (subtopics.json)
6. `existing_slugs_path`, `existing_titles_path`
7. `x_search_results_path` (オプション)
8. `serp_brief_path` (オプション) — 上位見出し・PAA を本文構成と FAQ に反映

### Step 2. slug と category 決定 (MECE 優先)

0. **`reserved_slug` が context にあれば、それを slug として確定し 1〜3 をスキップ** (親が MECE 選定済み・並列バッチと同流儀。slug を再生成しない)。出力は `output_contract.ja_mdx_path` / `en_mdx_path` の具象パスにそのまま書く。category は slug から逆引き、無ければ topic から判定
1. (`reserved_slug` が無い場合のみ) `unused_cells_path` を読み、`product == 指定` のセルから topic に最も近いものを優先採用 (`slug_pattern` をそのまま流用)
2. 一致する未使用セルが無い場合のみ、`subtopics.json[product].categories[*].examples[].slug_pattern` を派生 or 新規生成
3. `existing_slugs_path` と衝突する場合は派生語 (地域・観点) で必ずユニーク化 (例: `bright-data-pricing` → `bright-data-pricing-volume-discount`)。**slug に年号を焼き込まない** (ref §5.1)
4. title (ja / en) は既存 titles と 3-gram で 60% 未満一致を機械チェック
5. **category → intent を ref §4.1 で判定** (pricing=Transactional / vs-comp=Comparative / migration=Comparative・How-to / setup・troubleshooting=How-to / feature・security=Informational / faq・update-news=Informational)。この intent で §4.2 の必須ブロックと `references/templates/<intent>.mdx.tmpl` を選ぶ

### Step 2.5. 関連記事候補の振り分け (本文内自然リンク用)

- `related_candidates_path` の配列を読む
- **本文 H2 セクションのうち、関連性が高い箇所に最低 2 件** を以下の形式で自然リンク化:
  - `[アンカーテキスト](/media/<slug>)` (en 記事は `/en/media/<slug>`)
- 「関連記事はこちら」のようなリストにせず、**直前の文脈と接続して 1 行で紹介**
- 配置原則: 異なる H2 セクションに 1 件ずつ分散 (まとめて貼らない)
- 関連性が低い (tag overlap 0 + product 違い) 候補は本文に入れない (frontmatter `related` にも入れない)
- 候補 0 件 (初期段階の記事) は本文リンク 0 件で可だが、その旨を完了報告に明記

frontmatter の `related` フィールドは、本文挿入した既存記事 slug をそのまま列挙する (自動描画される文末関連記事リストとも揃える)。

### Step 3. X 検索結果から引用候補を選定

`x_search_results_path` を読み、以下の基準で 1〜3 件選ぶ:

- 公式アカウント (1Password / Bright Data / Next Engine 公式) 発表 → 優先
- 著名ユーザーの体験談 → 次点
- 議論の両論を扱う場合は肯定派・否定派の両方
- 同一ハンドル 2 個まで
- tweet ID を `metadata.x_post_ids` に記録
- 取得できない / 検索結果空 → 埋め込み 0 個で進めてよい (採点減点を覚悟、generator 側ではフォールバックしない)

### Step 4. ja MDX を生成

`article-template.mdx.tmpl` の骨格に肉付け。frontmatter の埋め方:

```yaml
---
title: "..."
date: "YYYY-MM-DD"
summary: "..."
slug: "<slug>"
lang: "ja"
tags: ["Primary KW", "Intent", "Product", "Tool"]
cover: "https://img.smile-comfort.com/<slug>/cover.webp"
heroImage: "https://img.smile-comfort.com/<slug>/cover.webp"
ogImage: "https://img.smile-comfort.com/<slug>/og.webp"
product: "<product>"
author: "smile-comfort"  # 必須: 個人名 (kei-nakazono など) は禁止。常に smile-comfort 固定 (ref-affiliate-article §9)
related: []              # オプション、空で OK (動的に選ばれる)
xPosts: ["<id1>", "<id2>"]
faq:
  - q: "..."
    a: "..."
  - q: "..."
    a: "..."
---
```

本文は ref-affiliate-article §4 のテンプレ + §4.1 で判定した intent の `references/templates/<intent>.mdx.tmpl` に従う:
- リード 150-200 字 (結論ファースト)
- 本文 H2 **3-6 個** (各 H2 = 2-4 H3)。**intent の §4.2 必須ブロックを必ず織り込む** (Transactional=料金シミュ+隠れコスト / Comparative=比較決定表+ケース別勝者 / How-to=手順チェックリスト+ロールバック / Informational=定義→仕組み→実務)
- **cv_readiness 要素**: BOFU (pricing/vs-comp/migration) は「向いている人／向いていない人」(代替案付き) と不安解消 2 つ (解約・返金・無料期間・日本語対応・データ移行から) を必ず入れる
- **CTA は ref §7 の product 別 CTA 基準表に従う**: 本文 30〜50% に `<InlineCTA product="<product>" intent="primary" />` 1 個 (必須)。**同一 intent の InlineCTA を 2 個以上置かない**
- (Next Engine / Bright Data のみ) 本文後半に `<InlineCTA product="<product>" intent="support" />` を 0-1 個
- (関連付けが成立する記事のみ) `<InlineCTA intent="self-product" ownProduct="trabell|catamap" />` を 0-1 個。判定ロジックは下の §自社プロダクト判定 を参照
- **本文中の AF 製品名にインラインアフィリエイトリンクを 3〜5 箇所** (ja/en それぞれ独立カウント)。詳細は ref §7.5。URL は product-`<product>`.md の「アフィリエイトリンク」を流用 (CTA と同 URL)。**`rel` 属性は書かない** (サイトが自動付与)。同一段落での 2 連続や、コードブロック・脚注・frontmatter への挿入は禁止
- `<TweetCard id="..." />` を 1-3 個
- `<Figure src="https://img.smile-comfort.com/<slug>/figure-01.webp" alt="..." caption="..." />` を 2-3 枚
- `serp_brief_path` があれば、上位記事の見出し論点をカバーし PAA を FAQ か H2 で回収する (intent_fit)
- **FAQ は frontmatter `faq` に 3-5 件のみ** (本文には書かない。二重表示防止)
- 末尾に `> ※情報は YYYY-MM-DD 時点の内容です。最新情報は公式サイトをご確認ください。`
- 末尾に `> ※本記事には PR を含みます。`

#### 自社プロダクト判定 (ref-affiliate-article §11 と同期)

| 条件 | 出すべき self-product CTA |
|---|---|
| `product == "brightdata"` | `<InlineCTA intent="self-product" ownProduct="trabell" />` を 1 個追加 (本文後半に Tra-bell の事実ベース 1 文も追加) |
| `product == "nextengine"` かつ topic に 楽天 / Yahoo! / 商品マスタ / カテゴリ / 属性 のいずれかを含む | `<InlineCTA intent="self-product" ownProduct="catamap" />` を 1 個追加 (本文後半に CataMap の事実ベース 1 文も追加) |
| `product == "nextengine"` だが楽天 / Yahoo! 関連ではない | self-product CTA は出さない |
| `product == "1password"` | 基本出さない。AI 受託 / Secrets Automation 文脈なら検討 |

判定が NG の場合に無理に出すと `affiliate_fit` と `product_pitch` で減点される。

#### 文字数

- 本文 (frontmatter / FAQ 除く) で **ja 2,500〜3,500 字**
- リード 150-200 字
- FAQ 3-5 問、答えは 80-200 字

### Step 5. en MDX を生成 (locales に "en" を含む場合のみ)

`locales` が `["ja"]` (nextengine 既定) なら **en は生成しない**。含む場合のみ以下。

ja の**主題・結論・事実**を保ちつつ、英語圏の検索意図に最適化する。逐語訳ではない。voice-guide.md §3 のルールに従う。

- **en の主要キーワードと検索意図を ja とは別に確認**する (ja の直訳 KW が英語圏で検索されるとは限らない)。title は en KW を前方に、60 char 以内
- 構成・見出し・FAQ・例示は**英語読者に最適な形へ再構成してよい** (H2 数や順序を ja と揃える必要はない)
- 文字数 **en 1,800〜2,500 words**
- 通貨は USD メイン (¥補記)
- **数値・料金・URL・固有名詞・製品名は ja と完全一致** (ここだけは parity 必須。片方だけ古い価格は致命)
- 同一の一次情報 (公式ページ・脚注 URL) を参照
- **本文中のインラインアフィリエイトリンクも 3〜5 箇所** (en の自然な誘導点に挿入)。URL は同じ AF URL、`rel` は書かない

### Step 6. metadata.json を生成

```json
{
  "slug": "<slug>",
  "product": "nextengine",
  "category": "setup",
  "title_ja": "...",
  "title_en": "...",
  "tags_ja": [...],
  "tags_en": [...],
  "author": "smile-comfort",
  "x_post_ids": ["1441...", "1872..."],
  "image_briefs": {
    "cover": {
      "prompt": "<thumbnail prompt for wrap-affiliate-thumbnail>",
      "filename": "cover.webp",
      "remote": "<slug>/cover.webp"
    },
    "og": {
      "prompt": "<OGP prompt>",
      "filename": "og.webp",
      "remote": "<slug>/og.webp"
    },
    "figures": [
      {
        "id": "figure-01",
        "prompt": "比較図プロンプト (左に...、右に...、矢印で...)",
        "alt": "...",
        "caption": "...",
        "mode": "comparison",
        "filename": "figure-01.webp",
        "remote": "<slug>/figure-01.webp"
      },
      {
        "id": "figure-02",
        "prompt": "プロセス図プロンプト (Step1 → Step2 → Step3)",
        "alt": "...",
        "caption": "...",
        "mode": "process",
        "filename": "figure-02.webp",
        "remote": "<slug>/figure-02.webp"
      }
    ]
  },
  "r2_uploads": [
    { "local": "output/<slug>/images/cover.webp",     "remote": "<slug>/cover.webp" },
    { "local": "output/<slug>/images/og.webp",        "remote": "<slug>/og.webp" },
    { "local": "output/<slug>/images/figure-01.webp", "remote": "<slug>/figure-01.webp" },
    { "local": "output/<slug>/images/figure-02.webp", "remote": "<slug>/figure-02.webp" }
  ]
}
```

### Step 7. 出力

- `output_contract.ja_mdx_path` に ja MDX を Write
- `output_contract.en_mdx_path` に en MDX を Write
- `output_contract.metadata_json_path` に metadata.json を Write

### Step 8. 完了報告

```
## アフィリエイト記事生成完了 (iteration {N})

- product: nextengine
- topic: 楽天連携の運用Tips
- slug: <slug>
- ja_mdx: src/lib/content/ja/media/<slug>.mdx (X字)
- en_mdx: src/lib/content/en/media/<slug>.mdx (X words)
- metadata: output/<slug>/metadata.json
- x_post_ids: [...]
- figures: 2
```

---

## 修正動作

`feedback_path` ファイルが存在 + 既存 ja_mdx/en_mdx が存在する場合のみ。

### Step 1. 前提読み込み

- 新規動作の全 ref に加え、`feedback_path` (Markdown)、既存 ja_mdx、en_mdx、`previous_metadata_path`

### Step 2. 修正指示の解析

feedback.md は通常以下のセクションを持つ:
- High priority (致命的)
- Medium priority
- Low priority
- ja/en parity issues

各指摘の `[<key>]` プレフィックスからどの軸の問題かを把握する。

### Step 3. 修正の大原則 (assign-slide-generator から踏襲)

**「削除」「減らす」「除く」は禁止**。情報を増やす方向の修正で対応:

| 修正タイプ | 良い対応 | 悪い対応 |
|---|---|---|
| 文字数オーバー | H3 で分割 / Callout に格納 | テキストを削る |
| H2 過多 | 隣接 H2 を統合 (H3 にする) | H2 ごと削除 |
| CTA 配置悪 | 既存 CTA を移動 | CTA を増やす/減らす |
| 禁止語 (絶対 / 100%) | 表現を緩める ("ほとんどのケースで") | 全文削除 |
| 弊社支援文言欠落 | リードか H2-2 に 1 文追加 | 既存 paragraph を上書き |

### Step 4. ja と en を同時に修正

ja/en parity issues は片方だけ直すと再採点で別の問題が出る。両方同時に直す。

### Step 5. metadata 更新

- 構造変更したら `image_briefs` も再評価
- 新規追加した X 引用があれば `x_post_ids` に追記

### Step 6. 出力 (新規と同じパス)

既存ファイルを上書き。

### Step 7. 完了報告

```
## アフィリエイト記事修正完了 (iteration {N})

- 修正内容:
  - [seo] H2 を 7 → 5 に統合 (H2-3 と H2-4 を結合)
  - [affiliate_fit] InlineCTA を末尾から H2-3 直後に移動
  - ...
- 削除を伴わない修正: ✓
```

---

## Gotchas

- **絶対パスを使う**: context: fork なので相対パスは解決失敗する
- **fork で読み込む ref は全て output_contract に明示**: 暗黙の相対パス参照禁止
- **iteration ≥ 2 で feedback が無い場合**: 修正動作ではなく新規動作になる (フォールバック)
- **既存 slug と完全一致したら**: slug を年月 / 派生語で変える。**勝手に既存記事を上書きしない**
- **X 検索結果が壊れている**: `x-search.json` が空配列 or エラー文字列なら埋め込み 0 個で進める。再検索は generator では行わない
- **frontmatter の `faq` キー**: 本文 MDX に H2「## よくある質問」を書くか、frontmatter の `faq` 配列に入れるかの 2 択。**両方書くと FAQAccordion が二重表示** されるので片方に統一する。デフォルトは frontmatter のみで本文に書かない
- **画像 URL はフル URL**: `cover`, `heroImage`, `ogImage`, `<Figure src=...>` は全部 `https://img.smile-comfort.com/<slug>/...`
- **disclosure 文言の必須**: 末尾 `※本記事には PR を含みます。` を必ず入れる
- **修正で字数が増えても OK**: 採点は字数の上限を超えなければ減点しない。下限は守る
