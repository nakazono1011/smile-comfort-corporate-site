# Voice Guide — Smile Comfort アフィリエイト記事

`ref-affiliate-article` の §4〜§7 を文書化したもの。`assign-affiliate-article-generator` が記事を書く際に守るスタイルガイド。

## §1. 全体のトーン

- 専門的だが上から目線にならない (中小企業の業務担当者が読むことを忘れない)
- **結論ファースト** (記事冒頭 200 字以内で主張を提示)
- 体感・実装目線 (「弊社が運用してきた経験では...」のような体験的な記述が望ましい)
- Pretty PR を避ける (「驚異的」「圧倒的」「最強」NG)

## §2. 日本語 (ja) スタイル

- 「ですます」調を基本、本文の所々で体言止めや「〜だ」調を 1 回程度混ぜて律動を出してもよい
- 全角句読点 (、 。 「 」)
- 千分位カンマあり (例: 2,980 円)
- 数字は半角、漢数字は固有名詞のみ
- 弊社の呼称は「弊社」「スマイルコンフォート」「当社」のいずれか統一 (記事内で混在禁止)
- 「導入」「運用」「設計」「構築」のような業務ワードを多用してよい
- 専門用語は初出で 1 行の定義を添える

### 字数

- 本文 (frontmatter / FAQ 除く) **2,500〜3,500 字**
- リード文 **150-200 字**
- FAQ 1 件の回答 **80-200 字**

## §3. 英語 (en) スタイル

- US 英語 (color, optimize, organize, customize)
- Active voice 優先 ("We deployed X" > "X was deployed")
- Sentence case for body, **Title Case for H2**
- Oxford comma 任意 (記事内で統一)
- 通貨は USD 主、JPY 補記 (例: "$20/mo (~¥2,980)")
- 日付は "May 2026" / "May 21, 2026"
- 弊社の呼称は "we" / "Smile Comfort" (記事内で統一)

### 字数

- 本文 **1,800〜2,500 words**
- Lead **80-120 words**
- FAQ 1 件の回答 **40-100 words**

## §4. ja/en ペアの整合性

- H2 の **数と順序** は両言語で同一
- 各 H2 の **意味** は完全に対応 (片方しかない節を作らない)
- **数値・URL・固有名詞・製品名**は完全一致
- **同じ tweet** を埋め込む (片方だけ X 引用無しは ja_en_parity 違反)
- **同じ Figure 画像**を参照 (片方だけ画像が多い・少ないは違反)

## §5. CTA 配置のルール

| 位置 | コンポーネント | 言語 | 個数 |
|---|---|---|---|
| 本文 30〜50% 地点 (H2-3 の直前または直後) | `<InlineCTA product="..." intent="primary" />` | ja, en 両方 | 各 1 個 (必須) |
| 本文 60〜80% 地点 (まとめ 1 つ手前) | `<InlineCTA product="..." intent="support" />` | ja, en 両方 | 各 0〜1 個 (Next Engine / Bright Data のみ) |
| 本文 70〜90% 地点 (まとめ直前) | `<InlineCTA intent="self-product" ownProduct="trabell\|catamap" />` | ja, en 両方 | 各 0〜1 個 (`ref-affiliate-article §11` の関連付けが成立するときのみ) |
| 記事末尾 | 自動描画 (サイト側が `frontmatter.product` から large variant を自動生成) | ja, en 両方 | 自動 |

中間 H2 の中 (たとえば H2-2 の段落の途中) に CTA を入れない。 **1 記事の合計 CTA は 3 個まで** (CTA 4 個以上は `affiliate_fit` で減点)。

## §6. X 埋め込みのルール

- 同じ tweet ID で `<TweetCard id="..." />` を ja/en 両方に置く
- 1 記事に **1〜3 個** (0 は最低限合格を逃す)
- 同じハンドルから 2 個まで
- 賛否両論を扱う記事は両派閥の声を載せる
- tweet の前後に「○○氏は X で次のように述べています」「For context, see this tweet from X」のような短い文脈付け 1 行

## §7. 画像挿入のルール

- カバー画像 (`heroImage` / `cover`) は記事冒頭に 1 枚 (`ArticleHero` で自動描画)
- 本文中の図解は `<Figure src="..." alt="..." caption="..." />` で 2-3 枚
- 図解の挿入位置: 各 H2 の終盤、主張を視覚的に補強するタイミング
- alt は ja 記事は日本語、en 記事は英語で具体的に書く (例: ja=「Next Engine と CROSS MALL の機能比較表」、en="Feature comparison between Next Engine and CROSS MALL")

## §8. NG 表現

### 薬機法・誇大広告

- 「絶対」「100%」「必ず」「永久」「万能」
- 「業界 No.1」「世界最速」「圧倒的」「劇的」(根拠 URL 必須)
- 「最強」「神」「これ 1 つで完璧」
- 効果保証 (「導入すれば売上 2 倍」)
- 個人を貶める表現

### 広告くささ (`affiliate_fit` で減点)

- 本文中央 (リード〜H2-3) に「弊社にご相談ください」「弊社の○○がオススメ」の能動的セールス文
- 1 段落に AF 製品名と弊社プロダクト名を同時に押し込む
- 自社プロダクト Tra-bell / CataMap を「最強の」「他社にはない」「唯一の」と書く (事実ベースで `〜のような構造` までで止める)
- 機能比較表に自社プロダクトを含める (プロダクト同士の競合に見える)
- 関連性のない記事に自社プロダクトを出す (例: 1Password 記事に Tra-bell)

---

## §9. 自社プロダクト言及ルール (ref-affiliate-article §11 と同期)

### 関連付け

| AF 製品 | 紐づく自社プロダクト | 関連付けの根拠 |
|---|---|---|
| Bright Data | **Tra-bell** | Tra-bell は Bright Data の Residential / Web Unlocker 上で運用 |
| Next Engine | **CataMap** | CataMap は楽天 / Yahoo! のカテゴリマッピング AI、Next Engine 周辺の商品マスタ整備と相性 |
| 1Password | (基本なし) | AI 受託の文脈で軽く触れる程度 |

### 作法

- **記事 1 本につき 1 回まで**
- **「弊社が運用している」「自社で使っている」程度の事実ベース言及** に留める
- リンクは本文 1 か所 + self-product CTA の 1 個まで (合計 2 か所が上限)
- **機能比較・料金比較に自社プロダクトを含めない**
- 関連付けが不自然なら無理に出さない (採点で減点される)

## §9. 内部リンク (関連記事の自然リンク化)

### 関連自社記事

- context JSON の `related_candidates_path` (= `related-candidates.json`) を必ず読み、**本文中に最低 2 件** を自然な文脈で `[アンカーテキスト](/media/<slug>)` 形式 (en 記事は `/en/media/<slug>`) で埋め込む
- 「関連記事はこちら」のような無機質なリストにしない。**直前の文脈と接続して 1 行で紹介する**:
  - 良い例: 「Bright Data の料金体系の詳細は [料金プラン早見表 2026](/media/bright-data-pricing-2026) で整理しています」
  - 悪い例: 「関連記事: [/media/bright-data-pricing-2026](/media/bright-data-pricing-2026)」
- 関連記事候補が 3 件以上ある場合は **本文の異なる H2 セクションに 1 件ずつ分散** 配置する (まとめて貼らない)
- **文末の関連記事一覧はサイトが自動描画** するので本文 MDX に書かない (`RelatedArticles` コンポーネントが `related` frontmatter + product/tags ベースの自動選定で 3 件表示)
- frontmatter の `related: [...]` は **特定の slug を確実に出したい時のみ手動指定**。空配列でも自動選定が走る

### コーポレートサイト誘導

- 弊社サービスへの参照は `/services/...` 等の固定 URL を 1 件まで
- 問い合わせ誘導は `InlineCTA` 経由 (本文中に `/contact` 等の直リンクを書かない)

### 外部リンク (出典)

- 競合製品の公式ページや業界レポートへ 1 件以上 (出典として明記)
- 公式ドキュメント・学術論文・ISO 仕様を脚注付きで引用する形が望ましい
- 非 HTTPS ソースへのリンクは禁止

## §10. Disclosure と日付明記

末尾に必須:

```markdown
> ※情報は YYYY-MM-DD 時点の内容です。最新情報は公式サイトをご確認ください。

> ※本記事には PR を含みます。
```

en 版:

```markdown
> Information current as of YYYY-MM-DD. Please check the official sites for the latest updates.

> This article contains affiliate links.
```
