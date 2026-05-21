---
name: ref-affiliate-article
description: 1Password / Bright Data / Next Engine アフィリエイト記事の編集方針・採点ルーブリック・ブランドガイド。run-affiliate-article から間接参照される (internal)。
user-invocable: false
disable-model-invocation: true
kind: essence
pair: assign-affiliate-article-evaluator
---

# Smile Comfort アフィリエイト記事 編集規範

合同会社スマイルコンフォート (`https://www.smile-comfort.com`) のメディアブログで公開するアフィリエイト記事の編集方針・採点ルーブリック・著者規定。`assign-affiliate-article-generator` が記事を書く拠り所、`assign-affiliate-article-evaluator` が採点する拠り所として参照する。

並置 artifact:
- `subtopics.json` … 各製品ごとのサブトピック分類表 (機械可読)

---

## §0. 会社プロファイル

合同会社スマイルコンフォートは下記 4 本柱の受託・自社プロダクト開発会社。記事のあらゆる文脈で「中の人がこの分野を業務として手がけている」立ち位置で書く。

### 4 つの専門領域 (Capabilities)

| 領域 | 内容 | 関連アフィリエイト |
|---|---|---|
| **データ分析基盤構築** | BigQuery / Snowflake / dbt 等を用いたデータ基盤の設計・実装・運用 | brightdata (収集側), nextengine (ソース側) |
| **スクレイピング開発** | Bright Data 等を活用した大規模スクレイピング基盤の構築・運用 | brightdata |
| **EC 運用支援** | Next Engine 等のツール導入・運用フロー設計・API カスタマイズ | nextengine |
| **AI 受託開発** | LLM 応用・分類タグ補完・自動化エージェント | (横断的) |

### 自社運用プロダクト (Own Products)

| プロダクト | URL | 概要 | 関連 |
|---|---|---|---|
| **Tra-bell** | https://www.tra-bell.com/ | スクレイピング技術を使ったホテル価格追跡サービス。**Bright Data 上で運用**。 | brightdata 系記事で「弊社事例」として |
| **CataMap** | https://catamap.app/ | 楽天市場 / Yahoo! ショッピングの商品属性・カテゴリマッピングを AI で補完する SaaS。 | nextengine / EC 系記事で「弊社事例」として |

### 記事ゴール (優先度順)

1. **アフィリエイト収益獲得** (Bright Data / 1Password / Next Engine の送客)
2. **自社プロダクト認知獲得** (Tra-bell / CataMap の名前と存在を読者に届ける)
3. **リード獲得** (スクレイピング・EC・データ基盤・AI 受託案件の問い合わせ)

3 つは独立しているのではなく重なる。本文の主役は **読者の課題解決** で、その回答として AF 製品 → さりげない弊社事例 → 必要なら相談という順に配置する。

---

## §1. ターゲット読者と価値命題

### 共通読者像

- **業務担当者** (中小企業の EC 運営・情シス・マーケ担当者)
- **意思決定権あり〜部分的な決裁者** (10〜300名規模の事業会社、SaaS 導入の社内検討者)
- **ライト開発者** (バックオフィスツール選定で技術記事も読む)

Pretty PR は禁止。読者は「具体的な料金・導入工数・運用コスト」を知りたい。

### 「広告くさくしない」基本方針

- **読者の課題解決が主役**。AF 製品の宣伝 / 弊社サービスの宣伝はあくまで脇役
- **弊社の専門性は事例として織り込む** (「弊社が運用している Tra-bell では...」)。「弊社にご相談ください」を本文中央には書かない (CTA セクションだけに集約)
- **自社プロダクトは "知っておくと便利な参考" 程度**。CTA でも価格・契約への誘導ではなく "見にいく" レベル
- **CTA は記事 1 本につき最大 3 個** (AF primary 1 個 + support 1 個 + self-product 0-1 個)
- **disclosure 文言は必須** ("※本記事には PR を含みます")

### 製品別の価値命題

| 製品 | スマイルコンフォートが提供する価値 | アフィリエイト戦略 |
|---|---|---|
| **Next Engine** | **弊社で導入実績あり。** 初期セットアップ・モール連携 (Amazon / 楽天 / Yahoo! / Shopify) ・在庫管理オートメーション・運用フローの設計支援を提供。**自社の CataMap** (楽天・Yahoo! カテゴリ AI 補完) も EC 運用の延長で関連付け可能。 | 主 CTA = `https://base.next-engine.org/account/?agent_code=MzEzNw` (Next Engine 公式アフィリエイトリンク、agent_code=MzEzNw)。secondary CTA = 弊社の EC 一元管理導入支援 (`/#contact`) |
| **Bright Data** | **弊社で運用実績あり。自社プロダクト Tra-bell も Bright Data 上で稼働中。** Residential / Datacenter / Web Unlocker / SERP API の設計・PoC・本番運用までを伴走支援。スクレイピング基盤と一緒に売る。 | 主 CTA = `https://get.brightdata.com/0cqcj8xp08fo` (Bright Data 公式アフィリエイトリンク)。secondary CTA = 弊社のスクレイピング基盤相談 |
| **1Password** | 純送客中心。ただし **AI 受託開発の文脈** (生成系アプリの API キー管理 / Secrets Automation) でなら関連付け可能。社内導入・チーム導入の検討段階の読者を 1Password に送る。 | 主 CTA = `https://1password.com/jp` (リンク TBD: ImpactRadius 経由 AF が決まり次第差替え) |

「Next Engine と Bright Data は『弊社の支援が買える』ことを毎記事で 1 回触れる」「自社プロダクト (Tra-bell / CataMap) は対応する AF 記事で 1 回ずつ自然に言及する」が編集方針。1Password は支援文言は無くてよい。

---

## §2. サブトピック分類 (MECE グリッド)

機械可読版は `subtopics.json` 参照。**製品 × カテゴリ** のグリッドを MECE (重複なし・漏れなし) に保つことが重複回避戦略の核心。記事 1 本につき **1 サブトピック** を主軸に据える。

サブトピック共通グリッド (各製品で同じ枠を用意):

| カテゴリ | 内容例 |
|---|---|
| `pricing` | 料金プラン比較・コスパ・隠れコスト |
| `setup` | 導入手順・初期設定・前提環境 |
| `case-study` | 導入事例・運用パターン |
| `migration` | 他ツールからの移行手順 |
| `vs-*` | 競合との比較 (vs-CrossMall, vs-Apify 等) |
| `troubleshooting` | エラー対処・運用トラブル |
| `security` | セキュリティ・コンプライアンス・ガバナンス |
| `feature-deep-dive` | 特定機能の深掘り (Web Unlocker, SSO 等) |
| `faq` | よくある質問まとめ |
| `update-news` | 最新アップデート速報 |

各製品ごとに 8〜12 個の派生サブトピックを持つ (詳細は `subtopics.json` `subtopics[].slug_pattern` を参照)。

### §2.5 テーマ選定の必須手順 (MECE 検証)

新規記事を書く前に、orchestrator (run-affiliate-article) が以下を機械的に実行する。

1. **空いているセルの洗い出し**:
   - `subtopics.json[product].categories[*].examples[].slug_pattern` から候補 slug を列挙
   - `existing-slugs.json` (動的生成された既存記事 slug) と差分を取り、**未使用 slug の一覧** を生成
   - 未使用 slug があるカテゴリを優先候補とする
2. **クラスター戦略の確認**:
   - 同一カテゴリの既存記事が 1 本もない → そのカテゴリを優先 (土台作り)
   - 同一カテゴリに 3 本以上ある → 別カテゴリへ
   - **pillar (土台) → cluster (派生)** の順に育てる
3. **ユーザー指定 topic との突き合わせ**:
   - ユーザーが指定した topic を最も近い (product, category, slug_pattern) にマッピング
   - マッピング先が既存 slug と衝突する場合、派生語 (年月・地域・観点) を付けてユニーク化
   - 例: 既存 `bright-data-pricing-2026` あり → 新規は `bright-data-pricing-volume-discount-2026`
4. **関連記事候補の収集** (本文内自然リンク用):
   - 同一 product の他記事 → 最大 3 件
   - 同一カテゴリの他製品記事 → 最大 2 件
   - これらを `related-candidates.json` として generator に渡す (本文中に最低 2 件は自然リンク化させる)
5. **抜けの記録**:
   - 既存記事と既存 slug カバレッジを `coverage-report.md` (任意) として記録し、月次でレビュー

generator はこの結果を context JSON 経由で受け取り、(a) 未使用 slug を採用、(b) 関連記事候補を本文内リンクに織り込む。

---

## §3. 評価ルーブリック (採点 7 軸、満点 100 点)

`assign-affiliate-article-evaluator` の `eval-schema.json` の `breakdown_keys` と同じキー名・配点。

### §3.1 `seo` (20 点) — SEO・構造

| 観点 | 配点 | 減点の目安 |
|---|---|---|
| `title` が主要キーワードを含み 60 字 (ja) / 65 char (en) 以内 | 4 | キーワード欠落 -3 / 80 字超過 -2 |
| `summary` (meta description) が主要キーワードと CTA 文脈を含み 120 字 (ja) / 155 char (en) 以内 | 3 | 主旨と乖離 -2 / 200 字超 -2 |
| H2 が 3〜6 個、論理的順序 | 4 | H2=2 以下 -3 / H2=8 以上 -2 / 並びが破綻 -2 |
| H3 が H2 ごとに 0〜4 個、入れ子が階層適切 | 3 | H4 を H2 直下に -2 |
| 内部リンク 2 件以上 (本文中の自然な `[アンカー](/media/<slug>)` リンク優先、無機質なリスト不可) | 2 | 0 件 -2 / リスト形式 -1 |
| 外部リンクが公式ドキュメント・公的ソース中心、出典明記 | 2 | リンク 0 件 -2 / 怪しい個人ブログ -1 |
| `slug`、`canonical`、`alternates.languages` の整合 | 2 | 不整合 -2 |

### §3.2 `readability` (15 点) — 可読性・構造

| 観点 | 配点 | 減点の目安 |
|---|---|---|
| 1 段落が ja 60-200 字 / en 30-100 words | 4 | 1 段落 300 字超 -2 / 隅々で 60 字未満が多発 -2 |
| 1 つの H2 セクションが ja 800 字超なら分割または H3 で構造化 | 3 | 800 字以上の壁テキスト -3 |
| リスト・テーブル・コードフェンスが本文に最低 1 つ以上 | 3 | 全くなく文章だけ -3 |
| 専門用語に初出で簡潔な定義あり | 2 | 一切なし -2 |
| 結論ファースト (記事冒頭 200 字以内で主張提示) | 3 | 結論が末尾でしか出ない -3 |

### §3.3 `affiliate_fit` (15 点) — アフィリエイト適性

| 観点 | 配点 | 減点の目安 |
|---|---|---|
| CTA が 2 個以上 3 個以下 (合計、self-product 含む) | 3 | 0 or 4+ -3 |
| CTA 配置 (本文 30〜50% に primary 1 個、末尾は自動描画) | 2 | 全部末尾 -2 |
| 誇張表現なし (薬機法的、効果保証など) | 2 | 「絶対」「100%」あり -3 |
| Disclosure 文言 (例「※本記事には PR を含みます」) が末尾近くにある | 2 | 完全に欠落 -2 |
| AF URL の貼り間違い・ハードコード混入なし | 3 | 別製品 AF 混入 -3 |
| **広告くささなし** (本文中央のセールス文・1 段落に AF + 自社プロダクト同時押し込み・機能比較表に自社プロダクト混入) | 3 | 該当ごとに -3 |

### §3.4 `x_embed` (10 点) — X 埋め込みの妥当性 + 記事テーマとの関連性

| 観点 | 配点 | 減点の目安 |
|---|---|---|
| 本文に `<TweetCard id="..." />` が 1〜3 個 | 2 | 0 個 -2 / 4 個以上 -2 |
| **Tweet 本文 (x-search.json の `inline_citations` から取得) が記事テーマ (タイトル/H2/H3 で扱う論点) と意味的に直接関連する** | 3 | 一般論やテーマ無関係 -3、製品名のみ一致で内容無関係 -2 |
| 各 tweet が **直前/直後の段落と意味的に整合** (引用する段落の主張を裏付けるか反論する) | 2 | 文脈無関係 -2 |
| 同一ハンドルから 2 個以下 | 1 | 同じ人から 3 個 -1 |
| 賛否両論を扱う記事では肯定・否定の両方を引用 | 1 | 片方しかなく偏見 -1 |
| **日本語記事に英語 Tweet / 英語記事に日本語 Tweet を採用する場合、直前または直後の blockquote で当該言語の訳を併記** | 1 | 翻訳併記欠落 -1 |

**evaluator (`assign-affiliate-article-evaluator`, `context: fork` で別 subagent / Haiku モデル) は以下を必ず実行**:
1. `x_search_results_path` の JSON から `inline_citations` を読み、各 Tweet の本文 (title/excerpt) を取得
2. その本文と、Tweet が配置された H2/H3 セクションのテーマを照合
3. 「Bright Data の話題に Bright Data と無関係な Tweet (例: 旅行・SNS 投稿)」「製品名は出るが意図が違う」など意味的乖離があれば feedback に明記して減点
4. ja MDX に英語 Tweet がある場合、その前後に日本語の翻訳 blockquote があるか確認

### §3.5 `product_pitch` (15 点) — 製品訴求の明確さ + 弊社事例の織り込み

| 観点 | 配点 | 減点の目安 |
|---|---|---|
| 対象製品の USP (差別化要素) が記事内に 2 個以上明示 | 3 | 1 個以下 -3 |
| 競合との違いを 1 個以上具体例で提示 | 3 | 全く無し -3 |
| 読者にとっての実利 (時短・コスト削減・運用負荷低下) が数字または事例で示される | 3 | 抽象的のみ -3 |
| **Next Engine / Bright Data の場合**: 弊社の導入・運用文言が 1 回以上含まれる | 3 | 欠落 -3 |
| **§11 関連付けが成立する場合**: 自社プロダクト (Tra-bell / CataMap) を 1 回 "事実ベース" で言及している | 3 | 欠落 -2 (致命傷ではない) / 関連性ない記事に出していたら -3 |

### §3.6 `duplication` (15 点) — 既存記事との重複度 + サブトピックの新規性

| 観点 | 配点 | 減点の目安 |
|---|---|---|
| `existing_slugs.json` 内に同名 slug がない | 3 | 同名 -4 |
| 既存記事 title と 3-gram 一致が 60% 未満 (cosine 類似度の代理計算) | 3 | 80% 超 -4 |
| 既存記事と同じ tag 配列 3 個以上 hit する記事がない | 3 | あり -3 |
| 既存記事と同 product × 同 subtopic ペアがない (MECE グリッド未使用セル採用) | 3 | あり -3 |
| `unused_cells_path` に候補があった場合、それを採用しているか | 3 | 未使用セルを無視し既存と近いセルで書いた -3 |

### §3.7 `ja_en_parity` (10 点) — ja/en 整合性

| 観点 | 配点 | 減点の目安 |
|---|---|---|
| ja と en で H2 の数と意味が一致 | 3 | H2 数差 ≥2 -3 |
| 各セクション字数比が 0.6〜1.4 倍 (英語は日本語の 0.4〜0.7 倍が標準だが意味量で判定) | 2 | 一方が極端に短い -2 |
| 数値・URL・固有名詞が完全一致 | 3 | 不一致 -3 |
| 通貨表記が ja=円メイン (USD 補記)、en=USD メイン (JPY 補記) | 2 | 通貨が片方しかない -2 |

---

## §4. 文字数と構成テンプレ

### 文字数目安

| 言語 | 本文 (frontmatter / FAQ 除く) | リード | FAQ |
|---|---|---|---|
| ja | 2,500〜3,500 字 | 150〜200 字 | 3〜5 問 |
| en | 1,800〜2,500 words | 80〜120 words | 3〜5 Q&A |

### 構成テンプレ

```
1. リード文 (150〜200 字 / 80〜120 words): 結論ファースト + 読者の悩み提示 + 約束
2. 本文 H2-1: 背景・前提知識 (or What is XXX)
3. 本文 H2-2: 主題のコア (How to / 比較表 / 機能解説)
4. 本文 H2-3: 実践 (Step-by-step or ケーススタディ)
   - <TweetCard id="..." /> でユーザーの実体験ポストを 1 件埋め込む
5. 本文 H2-4: トラブル対処 or 注意点 or Pros/Cons
6. CTA (InlineCTA, intent="primary" or "support") ← 本文 30〜50% 地点
7. 本文 H2-5: まとめ
8. FAQ (FAQAccordion で表示)
9. 最終 CTA (InlineCTA variant="large", 詳細ページで自動表示)
10. 著者プロフィール (自動表示)
11. 関連記事 (自動表示)
```

H2 を 4 つに圧縮するなら最低限 1, 2, 3, 5, 8 の構造を維持する。

---

## §5. ja/en ペアのローカライズ規則

- ja: 結論ファースト + ですます調 + 全角句読点 + 漢字適正密度
- en: SVO 簡潔 + active voice + 半角句読点 + sentence case (H2 はタイトルケース)
- ja の「弊社」「お問い合わせ」は en では "we"/"contact us"
- 通貨: ja は「2,980 円 (≒$20)」、en は "$20 (~¥2,980)"
- 数値: ja=全角数字禁止、半角数字 + 千分位カンマ
- 日付: ja は「2026 年 5 月」、en は "May 2026"
- 固有名詞: 一律 "Next Engine" "Bright Data" "1Password" のスペル
- 法的免責: 「※情報は YYYY-MM-DD 時点」を末尾 1 行で必須

---

## §6. X 埋め込みルール

- 1 記事に `<TweetCard id="..." />` を **1〜3 個** (0 個は最低限合格を逃す)
- 採用基準: 一次情報 / 公式アカウント発表 / 著名ユーザーの体験談 / 議論の両論
- **採用前提として、Tweet 本文と記事テーマ (タイトル / H2 / H3 で扱う論点) が意味的に直接関連していること**。製品名が一致するだけで内容が無関係な Tweet は採用しない (例: 旅行体験 / 個人的なつぶやき / 一般論で内容が薄い投稿)
- 同一ハンドル 2 個まで (3 個以上は採点減点)
- 賛否両論を扱う場合は肯定派・否定派の両方を引用
- 配置: 主張を裏付ける文脈 (引用する段落の直後または直前)
- tweet 本文を地の文で繰り返さない (二重表示にしない)
- 1 件もタイムラインから引けない場合は埋め込みなしで提出可 (採点減点を覚悟)

### §6.1 英語 Tweet を日本語記事に採用する場合の翻訳併記ルール (必須)

- **日本語記事 (lang: "ja") の MDX で英語 Tweet を `<TweetCard />` で埋め込む場合、その直前または直後に `>` blockquote で日本語訳を併記する**
- **英語記事 (lang: "en") の MDX で日本語 Tweet を採用する場合は、同様に英訳を blockquote で併記する**
- Twitter 埋め込みは原文のままで翻訳できないため、本文側で翻訳を提供する
- フォーマット例 (ja MDX):

  ```mdx
  > 「Bright Data の料金は読みづらい。コミット契約前提で見積もるべき」(原文: Bright Data pricing is unpredictable; commitments are a must.)

  <TweetCard id="2055211806508147018" />
  ```

- フォーマット例 (en MDX):

  ```mdx
  > "Bright Data is overkill for small projects, but unbeatable at scale." (Original: Bright Data は小規模だと過剰だが、大規模ではここ一択)

  <TweetCard id="2052344704772026749" />
  ```

- 訳文は記事の主張を補強する箇所に置き、Tweet が言いたいことを 1 文で要約してもよい (逐語訳でなくても可)
- evaluator は ja MDX 内の TweetCard 直前/直後 ±3 行に blockquote (日本語) があるかをチェックし、なければ §3.4 で減点

---

## §7. CTA 配置と種別

### CTA コンポーネント

`<InlineCTA ... />` で 3 種を切り分ける:

```mdx
<InlineCTA product="brightdata" intent="primary" />
<InlineCTA product="brightdata" intent="support" />
<InlineCTA intent="self-product" ownProduct="trabell" />
```

詳細ページの最終 CTA (variant="large") はサイト側が自動描画するので、本文 MDX に書かない。本文中の inline CTA だけ手書きする。

### 配置原則 (1 記事の合計 CTA は最大 3 個)

| 位置 | intent | 条件 | 個数 |
|---|---|---|---|
| 本文 30〜50% 地点 (H2-3 直前または直後) | `primary` | AF 製品 | 1 個 (必須) |
| 本文 60〜80% 地点 (まとめ 1 つ手前のセクション末尾) | `support` | Next Engine / Bright Data のみ | 0〜1 個 |
| 本文 70〜90% 地点 (まとめ直前) | `self-product` | §11 の関連付けが成立する場合 | 0〜1 個 |
| 記事末尾 | (自動描画) | - | 自動 |

中間 H2 セクションのど真ん中には CTA を置かない。文脈分断になる。

self-product CTA は **AF primary と support の両方が入った後の補足ポジション**。primary を押しのけて目立たせない。

---

## §8. NG 表現と「広告くささ」

### 薬機法・誇大広告 NG (書いたら即減点 -3〜-10 点)

- 「絶対」「100%」「必ず勝てる」「永久」「万能」
- 「業界 No.1」「世界最速」(根拠 URL がなければ NG)
- 「驚異的」「劇的」「圧倒的」(根拠 URL がなければ NG)
- 「最強」「神ツール」「これ 1 つで完璧」
- 効果保証 (「導入すれば必ず売上 2 倍」など)
- 個人情報・センシティブな比較 (年収・健康・宗教)

### 広告くささ NG (`affiliate_fit` 軸で減点 -3〜-8 点)

- 本文中央 (リード〜H2-3 まで) に「弊社にご相談ください」「弊社の○○がオススメ」のような能動的セールス文を入れる
- 1 つの段落に AF 製品名と弊社プロダクト名を同時に押し込む (例: 「Bright Data + 弊社支援 + Tra-bell」3 連続)
- 自社プロダクトを「最強の○○」「他社にはない」「唯一の」など差別化表現で書く (事実ベースで `〜のような構造` `〜のアプローチ` までで止める)
- CTA を 4 個以上配置する

---

## §9. 著者プロファイル

詳細は `src/config/authors.ts` (リポジトリ側) で管理。frontmatter `author` には ID のみ書く。

| ID | 名前 (ja) | 名前 (en) | 役割 |
|---|---|---|---|
| `kei-nakazono` | 中園 啓佑 | Kei Nakazono | 代表 / 技術寄り記事の主筆 |
| `smile-comfort` | スマイルコンフォート編集部 | Smile Comfort Editorial | デフォルト / 製品比較・ニュース記事 |

未指定 frontmatter は自動で `smile-comfort` にフォールバック。

---

## §10. 画像配信ポリシー

- 画像は Cloudflare R2 (`corporate-images` バケット) に置く。
- 配信ドメインは `https://img.smile-comfort.com/<slug>/<filename>.webp`
- MDX `frontmatter.cover` / `frontmatter.heroImage` は **絶対 URL** を入れる (相対パスにしない)
- 図解 `<Figure src="..." />` の src も絶対 URL
- 画像ファイル名は `cover.webp`, `og.webp`, `figure-01.webp`, `figure-02.webp`, ... の通し番号
- ALT は必ず日本語 (ja 記事) / 英語 (en 記事) で記述
- `wrap-thumbnails` / `wrap-ai-image-detail-illustration` で生成、wrangler でアップロードまで自動化 (`run-affiliate-article` Step 8)

---

## §11. 自社プロダクトの「さりげない」言及ルール

### 関連付け表 (どの AF 記事でどの自社プロダクトを出すか)

| AF 製品 | 主に関連する自社プロダクト | 関連付けの根拠 (本文で説明できる事実) |
|---|---|---|
| **Bright Data** | **Tra-bell** | Tra-bell は Bright Data の Residential / Web Unlocker を使ったスクレイピング基盤の上で運用中。料金最適化・PoC 経験あり |
| **Next Engine** | **CataMap** | CataMap は楽天 / Yahoo! のカテゴリマッピングを AI で補完する SaaS。Next Engine の商品マスタ整備や複数モール運用と相性が良い |
| **1Password** | (基本なし。AI 受託開発文脈で軽く触れる程度) | 生成 AI アプリの API キー管理 / Secrets Automation の文脈なら関連付け可能 |

### 言及の作法 (記事 1 本に 1 回まで)

1. **本文内では「弊社が運用している」「自社で使っている」程度の事実ベース言及** に留める
2. 機能比較・料金比較に **自社プロダクトを含めない** (プロダクト同士の競合に見える)
3. リンクは **§7 の self-product CTA か、本文 1 か所のリンク (Markdown) で 1 回まで**
4. **自社プロダクトの宣伝部分は記事の主目的にしない**。「Tra-bell の紹介」を目的に Bright Data 記事を書かない (逆もまた然り)
5. AF 記事と自社プロダクトの関連付けが不自然な場合 (例: 1Password 記事に Tra-bell を出す) は **無理に出さない**

### 言及テンプレート例

**Bright Data 記事内 (本文後半):**

> 弊社では、Bright Data の Residential プロキシを使ったホテル価格追跡サービス [Tra-bell](https://www.tra-bell.com/) を自社で運用しています。同様のスクレイピング基盤を構築するノウハウは PoC 段階から提供可能です。

CTA としては:
```mdx
<InlineCTA intent="self-product" ownProduct="trabell" />
```

**Next Engine 記事内 (本文後半):**

> 楽天 / Yahoo! ショッピングへの出品で「カテゴリと商品属性のマッピングが手間」というケースには、弊社の AI プロダクト [CataMap](https://catamap.app/) が役に立つかもしれません。Next Engine の商品マスタを整える前段の整理にも使えます。

CTA としては:
```mdx
<InlineCTA intent="self-product" ownProduct="catamap" />
```

### evaluator 採点との関係

- `product_pitch` (15 点) は「AF 製品の USP + 弊社事例の自然な織り込み」で採点。**Tra-bell / CataMap を該当 AF 記事で言及していれば +2〜+3**
- `affiliate_fit` (15 点) は「広告くささ」を含む。自社プロダクトを 2 回以上言及したり、機能比較表に入れたら **-3 以上**
- §11 の関連付けが成立しない記事 (1Password 記事に Tra-bell を出す) は減点対象 (-3)

---

## §12. 生成パイプラインとループ運用

```
[run-affiliate-article]
  ├─ X 検索 (run-x-search)
  ├─ 既存記事 slug/title/tag 抽出
  ├─ assign-affiliate-article-generator (ja/en 同時)
  ├─ assign-affiliate-article-evaluator (Haiku, 90 点合格)
  ├─ 不合格 → feedback.md を generator に戻す (最大 3 周)
  ├─ wrap-thumbnails (cover / og)
  ├─ wrap-ai-image-detail-illustration (figures 2〜3 枚)
  ├─ wrangler R2 upload
  └─ src/lib/content/{ja,en}/media/<slug>.mdx 書き出し
```

評価ループ上限は 3 周。それでも 90 点未到達なら人間に渡す (assign-slide-generator と同じ流儀)。
