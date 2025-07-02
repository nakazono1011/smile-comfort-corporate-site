<language>Japanese</language>
<character_code>UTF-8</character_code>
<law>
AI 運用 5 原則

第 1 原則： AI はファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/n でユーザー確認を取り、y が返るまで一切の実行を停止する。

第 2 原則： AI は迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。

第 3 原則： AI はツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。

第 4 原則： AI はこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。

第 5 原則： AI は全てのチャットの冒頭にこの 5 原則を逐語的に必ず画面出力してから対応する。
</law>

<every_chat>
[AI 運用 5 原則]

[main_output]

#[n] times. # n = increment each chat, end line, etc(#1, #2...)
</every_chat>

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

合同会社スマイルコンフォートのバイリンガルコーポレートサイト（日本語・英語対応）で、Next.js 15、React 19、TypeScript で構築されています。会社紹介とオウンドメディアによるアフィリエイト収益化・案件獲得を目的としています。MDX ベースのコンテンツ管理システムを採用。

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # 本番用ビルド（サイトマップ自動生成含む）
npm run start        # 本番サーバー起動
npm run lint         # ESLint実行
```

## アーキテクチャ

### App Router 構造

- Next.js 15 App Router を使用したバイリンガルルーティング
- 日本語（デフォルト）: `/` ルート
- 英語: `/en/` ルート
- メディア・ブログコンテンツ: `/media/` (ja) および `/en/media/` (en)

### 主要ディレクトリ

- `src/app/` - App Router ページとレイアウト
- `src/components/` - セクション/ui/site に分類された React コンポーネント
- `src/lib/content/` - MDX コンテンツファイル (ja/media/, en/media/)
- `src/lib/mdx.ts` - コンテンツ管理ユーティリティ
- `src/config/` - アプリケーション設定
- `src/i18n/` - next-intl による国際化設定

### 技術スタック

- **フレームワーク**: Next.js 15 with App Router, React 19, TypeScript
- **スタイリング**: Tailwind CSS（カスタムデザインシステム）, Shadcn UI コンポーネント
- **コンテンツ**: MDX with gray-matter (frontmatter 解析)
- **多言語対応**: next-intl
- **フォーム**: React Hook Form + Zod バリデーション
- **メール**: Resend サービス連携
- **SEO**: next-sitemap（バイリンガル hreflang サポート）

## コンテンツ管理

MDX ファイルは `src/lib/content/{lang}/media/` に保存され、以下の frontmatter 構造を持ちます：

```typescript
interface PostMeta {
  title: string;
  date: string;
  summary: string;
  slug: string;
  lang: "ja" | "en";
  tags?: string[];
}
```

コンテンツ操作には `src/lib/mdx.ts` の `getPostMeta()` と `getPost()` を使用してください。

## コーディング規約

`.cursorrules` のガイドラインに従ってください：

- TypeScript 優先、types より interface を使用
- 関数型プログラミングパターン、クラスは避ける
- 'use client' を最小限に抑制 - React Server Components を優先
- Shadcn UI と Tailwind を使用したスタイリング
- モバイルファーストなレスポンシブデザイン

注意：next-safe-action と nuqs の設定は完了していますが、まだ実装されていません。

## 設定ファイル

- `next.config.ts` - MDX と i18n サポートを含む Next.js 設定
- `tailwind.config.ts` - カスタムカラーパレットとデザイントークン
- `components.json` - Shadcn UI 設定
- `next-sitemap.config.js` - バイリンガル対応 SEO サイトマップ生成

## バイリンガル対応

- デフォルトロケール: 日本語 (`ja`)
- サポートロケール: 日本語 (`ja`), 英語 (`en`)
- コンテンツ構造はルーティング構造と一致
- 翻訳とロケール管理には next-intl を使用

## ビジネス目標

このサイトは以下の目的で運営されています：

- 合同会社スマイルコンフォートの会社紹介
- オウンドメディアによるアフィリエイト収益化
- メディアコンテンツを通じた案件獲得

## コンテンツ戦略

### トピッククラスター構造

3 つの主要 Pillar ページを中心としたクラスター戦略：

1. **プロキシ＆Web スクレイピング** (`/proxy-guide/`)

   - Bright Data 紹介とアフィリエイト収益化
   - 30 記事のクラスター構成（料金比較、Python 実装例、法的問題等）

2. **EC 一元管理ツール** (`/oms-guide/`)

   - ネクストエンジン中心の導入・運用解説
   - 30 記事のクラスター構成（API 連携、在庫管理、自動化等）

3. **パスワード管理ツール** (`/password-manager-guide/`)
   - 1Password 推奨の比較・選び方ガイド
   - 30 記事のクラスター構成（料金比較、セキュリティ解説、移行手順等）

### キーワード戦略

- 1 記事=1 Primary KW + 2-3 関連語
- 日本語：カタカナ/英字揺れ両方対応
- 英語：US 英語統一、メタタグ EN-US 指定
- 検索ボリュームより購入意図を優先
