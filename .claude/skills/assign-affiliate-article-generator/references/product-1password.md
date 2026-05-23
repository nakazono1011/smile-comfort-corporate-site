# Product Reference — 1Password

`assign-affiliate-article-generator` が 1Password の記事を書く際の事実拠り所。

## 製品概要

- 提供元: 1Password (旧 AgileBits、本社 カナダ・トロント)
- カテゴリ: パスワードマネージャー / Secrets Management
- ターゲット: 個人〜エンタープライズ (家族・チーム・大企業まで)
- リリース: 2006 年〜
- 公式: https://1password.com/ (https://1password.com/jp も日本語)
- 公式 X: @1Password

## 主要機能

| カテゴリ | 機能 |
|---|---|
| パスワード保管 | エンドツーエンド暗号化、Secret Key + マスターパスワード方式 |
| 自動入力 | ブラウザ拡張・モバイルアプリで Web/アプリへ自動入力 |
| パスワード生成 | 長さ・記号・読みやすさをカスタム |
| Passkey 対応 | 2024-2025 で対応強化、FIDO2 / WebAuthn |
| SSH キー管理 | SSH エージェント機能、GitHub commit signing |
| Watchtower | パスワード漏洩・脆弱性チェック (Have I Been Pwned 連携) |
| SSO 統合 | Okta / Azure AD / Google Workspace / Microsoft Entra |
| Secrets Automation | CLI / SDK / CI/CD 統合 (Vault 代替) |
| Travel Mode | 国境通過時に一時的に Vault を隠す |
| Family / Team Sharing | アイテム単位の共有、権限管理 |

## 料金プラン (2026 年時点、公式サイト要確認)

| プラン | 月額/年額 | 特徴 |
|---|---|---|
| Individual | $2.99/月 | 1 人、Watchtower 含む |
| Families | $4.99/月 | 5 人まで、共有 Vault |
| Teams Starter Pack | $19.95/月 (固定) | 10 ユーザーまで、小規模事業者向け |
| Business | $7.99/ユーザー/月 | SSO、SCIM、コマンドライン、API |
| Enterprise | 要問い合わせ | 専任担当、SLA、SAML 統合 |

※ 日本では JPY 表示も可能 (Individual ≒ 450 円/月)。

## USP (差別化要素)

1. **セキュリティアーキテクチャ**: マスターパスワード + Secret Key の 2 層、ゼロ知識
2. **Passkey 対応の早さ**: 業界トップクラスでの Passkey 対応・移行ガイド
3. **エンタープライズ機能**: SSO、SCIM プロビジョニング、Secrets Automation
4. **クロスプラットフォーム**: macOS / Windows / Linux / iOS / Android / Browser
5. **Developer 向け統合**: SSH エージェント、`op` CLI、GitHub Actions 連携
6. **UI/UX 品質**: 設計の評価が高く、サードパーティ製アプリ並みの UI

## 競合

| 競合 | 強み | 1Password との違い |
|---|---|---|
| Bitwarden | OSS、無料プランあり | 1Password は UI と Enterprise 機能で優位 |
| LastPass | 2022 年漏洩事件で信頼低下 | 1Password は信頼性・移行ガイドで優位 |
| Dashlane | VPN 同梱 | 1Password の方が Developer 寄り機能多い |
| Keeper | エンタープライズ機能 | UI とエコシステムで 1Password が優位 |
| iCloud Keychain | 無料・Apple 統合 | 1Password はクロスプラットフォーム + 共有機能 |

## 弊社の支援文言

**1Password は基本は純送客**。Next Engine / Bright Data と違い、弊社の支援文言は控えめに。ただし、関連が成立するなら以下の文脈で軽く触れてよい:

- **AI 受託開発の文脈** (Secrets Automation / API キー管理): 「弊社の AI 受託開発でも、LLM プロバイダの API キーや SaaS 認証情報を 1Password Secrets Automation で管理しています」程度
- **チーム導入の運用設計** (Teams / Business プラン記事): 「弊社では 1Password の社内導入支援 (運用ポリシー策定、SSO 接続、社員向けトレーニング設計) もサポート可能です」

**自社プロダクト Tra-bell / CataMap は基本的に出さない**。1Password と直接の関連性がないため、無理に出すと広告くさくなる。例外として「複数 SaaS の認証情報を管理しないと開発が回らない」のような汎用論なら 1 行触れる程度は可。

## CTA URL (3 URL を文脈別に使い分ける)

| 用途 | URL | 主導線か |
|---|---|---|
| **汎用 / デフォルト** (個人・ビジネス問わず誘導) | **`https://1password.partnerlinks.io/sc-link`** | ✓ (全記事の主導線。`<InlineCTA primary />` もこれを使う) |
| **Business 専用** (ビジネス特化記事のみ) | **`https://1password.partnerlinks.io/dobcflhz59kl-d8wpd`** | ビジネス特化記事でのみ併用 |
| **乗り換え促進** (他社からの移行。1Password が乗り換え前の既存ライセンス費用を一部負担) | **`https://1password.partnerlinks.io/6dieu4x28dzi-gp0g2q`** | 乗り換え文脈でのみ併用 |
| 公式日本語サイト (リンク先としては使わない、参考用) | `https://1password.com/jp` | — |
| 公式英語サイト (リンク先としては使わない、参考用) | `https://1password.com/` | — |

- `<InlineCTA product="1password" intent="primary" />` は **汎用 sc-link URL** を指す (`src/config/affiliate.ts` で定義)
- Business 専用 URL と乗り換え URL は CTA コンポーネントでは使わず、本文中のインラインリンクで **該当する文脈の記事に限り併用** する

## 本文中の AF 製品名インラインリンク (3〜5 箇所必須)

`<InlineCTA product="1password" intent="primary" />` だけでは CTA セクションを飛ばす読者に届かないため、本文中の「1Password」表記にも自然な箇所で **3〜5 箇所** インラインリンクを織り込む (ja/en それぞれ独立カウント)。詳細ルール・配置原則・避けるべき場所は [ref-affiliate-article §7.5](../../ref-affiliate-article/SKILL.md) を参照。

### URL の使い分け (記事カテゴリ別)

判定フロー:

1. **記事の主題がビジネス特化か?** (tags/topic に Business / Teams / Enterprise / SSO / SCIM / Secrets Automation / 法人導入 / チーム運用 / 社内導入 を含む)
   - YES → **Business 専用 URL** (`partnerlinks.io/dobcflhz59kl-d8wpd`) を 1〜2 箇所 + **汎用 URL** (`sc-link`) を 1〜2 箇所、計 3〜5 箇所
2. **記事が乗り換え/移行を主題にしているか?** (タイトル/H2 に「乗り換え」「移行」「from Bitwarden」「LastPass 代替」など)
   - YES → **乗り換え URL** (`partnerlinks.io/6dieu4x28dzi-gp0g2q`) を 1〜2 箇所 + **汎用 URL** (`sc-link`) を 1〜2 箇所、計 3〜5 箇所
3. **それ以外** (個人向け、機能解説、Passkey、ファミリープラン、価格、Watchtower、Travel Mode、中立的な比較記事など)
   - 全箇所で **汎用 URL** (`sc-link`) を使う。3〜5 箇所

共通: **どのカテゴリでも、汎用 URL (`sc-link`) は最低 1 箇所は必ず含める**。これが主導線。

### 記述例

汎用 (どの記事でも使える):

> [1Password](https://1password.partnerlinks.io/sc-link) は Secret Key + マスターパスワードの 2 層構造で、サーバ側漏洩時もデータ復元不能な設計を採用しています。

Business 特化記事のみ:

> 中規模以上の組織が SSO や SCIM プロビジョニング、Okta / Azure AD 連携を求めるなら [1Password Business](https://1password.partnerlinks.io/dobcflhz59kl-d8wpd) が現実解です。

乗り換え記事のみ:

> Bitwarden や LastPass から 1Password に乗り換える場合、移行前のサブスク費用を一部負担してくれる [1Password の引っ越しサポート](https://1password.partnerlinks.io/6dieu4x28dzi-gp0g2q) を活用すると、契約期間の重複を気にせず移行できます。

### 配置原則

- 推奨位置: H2-1 リードイン / 機能紹介セクション / まとめ冒頭 / (ビジネス特化記事の) チーム導入セクション / (乗り換え記事の) 移行手順セクション
- Markdown 形式: `[1Password](URL)` / `[1Password Business](URL)` / `[1Password の引っ越しサポート](URL)` 等、アンカーテキストは文脈に合わせる
- 競合製品 (Bitwarden / LastPass / Dashlane / Keeper / iCloud Keychain など) には貼らない
- 同じ段落で 2 URL を併用しない
- 1 記事内で 3 URL を全部使い分けるのは過剰。多くて 2 種類まで

## 訴求軸

- **セキュリティ**: 「Secret Key + マスターパスワードの 2 層で、サーバ側漏洩時もデータ復元不能」
- **生産性**: 「ログインの 1 操作短縮で年間 100 時間以上の節約 (1 日 3 サイト × 30 秒 × 365 日)」
- **チーム運用**: 「Vault 単位の権限管理で『あの担当者しか知らない』を排除」
- **Passkey 対応**: 「2025 年以降の認証トレンドにキャッチアップ、移行サポート有り」

## 避けるべき表現

- 「絶対に漏れない」(NG: 効果保証)
- 「世界 No.1」(根拠 URL 必須)
- 「すべてのサービスで Passkey 対応」(現実は対応サイトに依存)

## 出典・参考リンク

- 公式 (jp): https://1password.com/jp
- 公式 (en): https://1password.com/
- 料金: https://1password.com/jp/pricing
- 機能一覧: https://1password.com/features
- Passkey ガイド: https://1password.com/jp/passkeys
- ヘルプ: https://support.1password.com/
- 公式 X: https://x.com/1Password
