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

## CTA URL

- 主 CTA URL (現状): `https://1password.com/jp` (公式 LP)
- 公式アフィリエイトは Impact Radius 経由などで未契約のため、確定し次第差替え (**TODO**)
- 公式英語サイト: `https://1password.com/`

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
