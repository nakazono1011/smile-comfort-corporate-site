# Product Reference — Bright Data

`assign-affiliate-article-generator` が Bright Data の記事を書く際の事実拠り所。

## 製品概要

- 提供元: Bright Data (旧 Luminati) - イスラエル発、現在は米国本社
- カテゴリ: プロキシネットワーク + データ収集プラットフォーム
- ターゲット: 中堅〜エンタープライズ (スタートアップ〜年商数百億規模、データ分析・価格モニタリング・SEO 監視・市場調査用途)
- 公式: https://brightdata.com/ (https://brightdata.jp/ が日本語版)
- 公式 X: @bright_data
- アフィリエイトリンク: **https://get.brightdata.com/0cqcj8xp08fo** (記事中の primary CTA で使用)

## プロダクトラインナップ

| 製品 | 用途 | 料金感 |
|---|---|---|
| **Residential Proxy** | 一般家庭の IP を経由、ボット検知回避力高 | $15/GB 〜、ボリュームで割引 |
| **Datacenter Proxy** | データセンター IP、高速・安価だが検知されやすい | $0.5/GB 〜 |
| **ISP Proxy** | ISP 発行の静的住宅 IP、Residential の検知耐性 + 速度 | $11/IP/月 〜 |
| **Mobile Proxy** | 4G/5G モバイル IP、最も検知耐性高、最も高価 | $40/GB 〜 |
| **Web Unlocker** | bot 検知・CAPTCHA を自動突破する API | $3/1k req 〜 |
| **SERP API** | Google / Bing 等の検索結果を構造化 JSON で取得 | $3/1k req 〜 |
| **Dataset Marketplace** | 既製データセット (Amazon 商品、LinkedIn プロフィール等) | データセット単位 |
| **Scraping Browser** | Puppeteer / Playwright 互換、Stealth 機能内蔵 | $9/GB 〜 |

## USP (差別化要素)

1. **IP プールの規模**: 1.5 億 IP (世界最大級)、195 か国網羅
2. **コンプライアンス**: KYC (本人確認) で IP 出所を担保、GDPR / CCPA 準拠
3. **Web Unlocker の自動化**: CAPTCHA / Cloudflare / Akamai 等の bot 防御を自動突破
4. **エンタープライズ向け SLA**: 99.99% アップタイム保証、24/7 サポート
5. **API カバレッジ**: Proxy だけでなく SERP / Scraping Browser / Dataset まで一気通貫

## 競合

| 競合 | 強み | Bright Data との違い |
|---|---|---|
| Oxylabs | Residential プロキシ、企業向け | Bright Data より製品ラインアップが狭い |
| Smartproxy | 個人〜中小向け、価格安め | Bright Data より IP プール小、エンタープライズ機能弱 |
| Apify | スクレイピング SaaS、ノーコード | Bright Data はインフラ層、Apify はアプリ層 |
| ScraperAPI | Web Unlocker 系の代替 | Bright Data の方が IP 規模・SLA で優位 |
| Decodo (旧 Smartproxy) | 中価格帯 | Bright Data は上位互換 |

## 弊社 (合同会社スマイルコンフォート) の運用ノウハウ

**弊社は Bright Data を実プロダクションで運用してきた経験あり**。代表的な実績として、自社運用プロダクト **Tra-bell** (https://www.tra-bell.com/) — スクレイピング技術を使ったホテル価格追跡サービス — を Bright Data の Residential Proxy / Web Unlocker 上で稼働させている。

提供メニュー:

- 用途別の Proxy Zone 設計 (例: 価格モニタリングは Residential / SERP 監視は SERP API)
- スクレイピング基盤の構築 (AWS Lambda + Bright Data + S3 + Snowflake 等)
- データ分析基盤との接続 (BigQuery / Snowflake / dbt パイプライン)
- コスト最適化 (Residential vs Datacenter の切り替え、リクエストキャッシュ、リトライ戦略)
- コンプライアンス整備 (robots.txt 遵守、レート制御、利用規約レビュー)
- PoC → 本番運用への移行支援
- 既存スクレイパーの Web Unlocker 化

### 記事内での訴求文言テンプレート

控えめな事実ベースの一文 (本文後半 H2 セクション末尾あたりに 1 回):

> 弊社では、Bright Data の Residential プロキシを使ったホテル価格追跡サービス [Tra-bell](https://www.tra-bell.com/) を自社で運用しています。同様のスクレイピング基盤の設計・PoC・運用までは要件次第でご相談可能です。

CTA を立てるならまず Bright Data の AF (`InlineCTA intent="primary"`)、次に弊社支援 (`InlineCTA intent="support"`)、最後に補足的に自社プロダクト (`InlineCTA intent="self-product" ownProduct="trabell"`) という順で 3 つまで配置。**1 段落に 3 つ全部を押し込まない**。

## CTA URL

- 主 CTA URL (アフィリエイト): **https://get.brightdata.com/0cqcj8xp08fo**
- 弊社支援 CTA URL: `/contact`
- 公式日本語サイト: `https://brightdata.jp/`
- 公式英語サイト: `https://brightdata.com/`

## 本文中の AF 製品名インラインリンク (3〜5 箇所必須)

`<InlineCTA product="brightdata" intent="primary" />` だけだと CTA セクションを飛ばす読者に届かないため、本文中の「Bright Data」表記にも自然な箇所で **3〜5 箇所** インラインリンクを織り込む (ja/en それぞれ独立カウント)。詳細ルール・配置原則・避けるべき場所は [ref-affiliate-article §7.5](../../ref-affiliate-article/SKILL.md) を参照。

- リンク URL: **`https://get.brightdata.com/0cqcj8xp08fo`** (公式サイト `brightdata.com` ではなく AF URL を使う)
- Markdown 形式: `[Bright Data](https://get.brightdata.com/0cqcj8xp08fo)` または `[Bright Data Scraping Browser](https://get.brightdata.com/0cqcj8xp08fo)` のように製品名・機能名込みで貼って OK
- 推奨位置: H2-1 リードイン / Scraping Browser・Web Unlocker・SERP API などの機能紹介セクション / まとめ冒頭
- 競合製品 (Smartproxy / Apify / Oxylabs / Decodo など) には貼らない

## 訴求軸

- **データの質**: 「Bright Data の Residential なら検知率 0.5% 以下に抑制」(数値は実運用感、必要に応じ "弊社運用感では" と補足)
- **コスト効率**: 「Datacenter と Residential を組み合わせて 60% コストダウン可能」
- **コンプライアンス**: 「KYC 済みの IP のみ使うことで法務リスクを低減」
- **拡張性**: 「Proxy → Web Unlocker → SERP API へ段階的に拡張できる」

## 法的・倫理的注意 (記事内で必ず触れる)

- スクレイピング対象サイトの利用規約を確認すること
- robots.txt と Crawl-Delay を尊重
- 個人情報保護法 / GDPR / CCPA に注意
- レート制限を超える負荷をかけない

## 避けるべき表現

- 「Bright Data を使えば検知されない」(NG: 効果保証)
- 「すべての CAPTCHA を突破できる」(NG: 100%)
- 「合法的にどんなサイトでもスクレイピングできる」(NG: 過大、サイト規約次第)

## 出典・参考リンク

- 公式 (en): https://brightdata.com/
- 公式 (ja): https://brightdata.jp/
- 料金: https://brightdata.com/pricing
- 製品比較: https://brightdata.com/proxy-types
- ドキュメント: https://docs.brightdata.com/
- 公式 X: https://x.com/bright_data
- アフィリエイト LP (記事から飛ぶリンク): https://get.brightdata.com/0cqcj8xp08fo

---

## 一次データ・実運用エビデンス（E-E-A-T 用）

> **警告 (全 product ファイル共通)**: ここに無い数値・事例を創作しない。実測値が無ければ定性的記述に留め、`factual_accuracy` で捏造扱いされることを避ける。ユーザーから実データが提供されたら本節を更新する。

弊社が Bright Data 上で Tra-bell を実運用している事実ベースの観点。記事に自然に織り込む際は、以下を「事実として言及してよい観点」として使う。**削減率 (%)・金額・処理件数などの具体的な実測値は、必ず `{{実測値: 未確定 — ユーザー提供待ち}}` のプレースホルダのままにし、値が確定するまで記事本文に数値を書かない。**

- **Residential Proxy の運用**: Tra-bell のホテル価格取得で Residential Proxy を用いている (検知回避のための IP ローテーション運用)。検知率・成功率の実測値は {{実測値: 未確定 — ユーザー提供待ち}}
- **Web Unlocker の活用**: CAPTCHA・bot 検知が強いサイトに対して Web Unlocker を併用してきた運用経験。導入前後の成功率変化は {{実測値: 未確定 — ユーザー提供待ち}}
- **コスト最適化 PoC 経験**: Datacenter / Residential / ISP プロキシの使い分けによるコスト最適化の設計・PoC 経験がある。削減率・削減金額は {{実測値: 未確定 — ユーザー提供待ち}}
- **スクレイピング基盤の構成**: AWS Lambda / S3 / Snowflake 等と組み合わせた基盤の設計・運用経験。処理件数・実行頻度は {{実測値: 未確定 — ユーザー提供待ち}}
- **コンプライアンス運用**: robots.txt 遵守・レート制御・KYC 済み IP の利用方針を踏まえた運用 (数値化不要、定性的な言及のみで可)

記事内での安全な言及例 (実測値が未確定の間はこの粒度に留める):

> 弊社では Bright Data の Residential Proxy と Web Unlocker を組み合わせてホテル価格追跡サービス Tra-bell を運用しています。用途に応じてプロキシ種別を切り替える設計により、コスト効率とブロック回避率のバランスを取っています。
