# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## 記事生成パイプライン（唯一の正）

メディア記事（`src/lib/content/{ja,en}/media/*.mdx`）の生成・改善は、`.claude/skills/` 配下のスキル群が唯一の正とする。手書き・アドホックなテンプレートやスプレッドシート手順は使わない。

- 起点: `run-affiliate-article`（X検索 → ja/en MDX 生成 → 評価ループ → 画像生成 → R2 アップロード）
- 生成: `assign-affiliate-article-generator` / 採点: `assign-affiliate-article-evaluator`
- 規範: `ref-affiliate-article`（編集方針・採点ルーブリック・ブランドガイド・MECE グリッド `subtopics.json`）

### 実装との整合ルール（過去の齟齬を踏まえた必須事項）

- 画像は Cloudflare R2 の**絶対 URL**（`https://img.smile-comfort.com/<slug>/…`）。`/public/images/` の相対パスは使わない。
- MDX で使えるコンポーネントは `src/components/mdx/mdx-components.tsx` に定義されたものだけ（`InlineCTA` / `Figure` / `Callout` / `TweetCard` / `ClientTweetCard` / `FAQAccordion` / `Citation`）。`PlaywrightMCP` 等の存在しないコンポーネントは書かない。
- FAQ は frontmatter `faq:`（`{q, a}[]`）に格納する（本文には書かない）。`FAQAccordion` と FAQPage JSON-LD は frontmatter を参照する。
- アフィリエイトリンクの `rel="sponsored nofollow …"` はサイト側（`mdx-components.tsx`）が AF ホスト判定で自動付与する。MDX に rel 属性は書かない。
- frontmatter `author` は必ず `smile-comfort`（個人名禁止）。
- 広告開示はサイト側が記事冒頭（`AffiliateDisclosure`）と末尾（本文の PR 注記）で二重に表示する。
- ロケール URL: ja = `/media/{slug}`、en = `/en/media/{slug}`。
- 本文・脚注の URL は山括弧 `<...>` で囲まない。`<https://example.com>`（GFM autolink）は MDX が JSX タグ開始と誤認して `next build` が落ちる。裸の `https://example.com` か `[表示文字](https://example.com)` を使う（remark-gfm が裸 URL を自動リンク化）。

> 旧 `claude.md`（Playwright MCP 画像指示 / `wordCountTarget` / `pillarSlug` / `glossary.json` / 相対画像パス / 語数 1100–1700 等）は現行実装と矛盾するため撤去した。上記スキル群と本ファイルが正。

## 開発コマンド

```bash
npm run dev              # 開発サーバー起動 (http://localhost:3000)
npm run build            # 本番用ビルド
npm run postbuild        # サイトマップ + llms.txt 生成（build 後に自動実行）
npm run start            # 本番サーバー起動
npm run lint             # ESLint実行
```

## アーキテクチャ

### App Router 構造

- Next.js App Router を使用したバイリンガルルーティング
- 日本語（デフォルト）: `/` ルート
- 英語: `/en/` ルート
- メディア・ブログコンテンツ: `/media/` (ja) および `/en/media/` (en)

### 主要ディレクトリ

- `src/app/` - App Router ページとレイアウト
- `src/components/` - セクション/ui/site/mdx/seo に分類された React コンポーネント
- `src/lib/content/` - MDX コンテンツファイル (ja/media/, en/media/ ほかカテゴリ)
- `src/lib/mdx.ts` - コンテンツ管理ユーティリティ
- `src/config/` - アプリケーション設定（`affiliate.ts` / `company.ts` / `authors.ts`）
- `src/i18n/` - next-intl による国際化設定

### 技術スタック

- **フレームワーク**: Next.js App Router, React 19, TypeScript
- **スタイリング**: Tailwind CSS（カスタムデザインシステム）, Shadcn UI コンポーネント
- **コンテンツ**: MDX (next-mdx-remote / compileMDX) + gray-matter (frontmatter 解析), remark-gfm
- **多言語対応**: next-intl
- **フォーム**: React Hook Form + Zod バリデーション
- **メール**: Resend サービス連携
- **SEO**: next-sitemap（バイリンガル hreflang サポート）, JSON-LD (Article / FAQPage / Organization)

## コンテンツ管理

MDX ファイルは `src/lib/content/{lang}/media/` に保存される。frontmatter の型は `src/lib/mdx.ts` の `PostMeta` interface が唯一の正：

```typescript
interface PostMeta {
  title: string;
  date: string;
  summary: string;
  slug: string;
  lang: "ja" | "en";
  tags?: string[];
  category?: string;
  cover?: string;
  updated?: string;
  readTime?: number;
  author?: string;
  ogImage?: string;
  heroImage?: string;
  product?: "1password" | "brightdata" | "nextengine";
  featured?: boolean;
  related?: string[];
  xPosts?: string[];
  faq?: { q: string; a: string }[];
}
```

コンテンツ操作には `src/lib/mdx.ts` の `getPostMeta()` と `getPost()`、FAQPage 用に `resolveFaqs()` を使う。

## コーディング規約

`.cursorrules` のガイドラインに従う：

- TypeScript 優先、types より interface を使用
- 関数型プログラミングパターン、クラスは避ける
- 'use client' を最小限に抑制 - React Server Components を優先
- Shadcn UI と Tailwind を使用したスタイリング
- モバイルファーストなレスポンシブデザイン

注意：next-safe-action と nuqs の設定は完了しているが、まだ実装されていない。

## 設定ファイル

- `next.config.mjs` - MDX と i18n サポートを含む Next.js 設定（画像は `img.smile-comfort.com` のみ許可）
- `tailwind.config.ts` - カスタムカラーパレットとデザイントークン
- `components.json` - Shadcn UI 設定
- `next-sitemap.config.js` - バイリンガル対応 SEO サイトマップ生成（`lastmod` は記事の `updated||date` を反映）

## バイリンガル対応

- デフォルトロケール: 日本語 (`ja`)
- サポートロケール: 日本語 (`ja`), 英語 (`en`)
- コンテンツ構造はルーティング構造と一致
- 翻訳とロケール管理には next-intl を使用

## ビジネス目標

このサイトは以下の目的で運営されている：

- 合同会社スマイルコンフォートの会社紹介
- オウンドメディアによるアフィリエイト収益化
- メディアコンテンツを通じた案件獲得

## コンテンツ戦略

### トピッククラスター構造

3 つの主要クラスターを軸にした戦略（詳細な MECE グリッドは `.claude/skills/ref-affiliate-article/subtopics.json`）：

1. **プロキシ＆Web スクレイピング** — Bright Data のアフィリエイト収益化
2. **EC 一元管理ツール** — ネクストエンジン中心の導入・運用解説
3. **パスワード管理ツール** — 1Password 推奨の比較・選び方ガイド

### キーワード戦略

- 1 記事 = 1 Primary KW + 2-3 関連語
- 日本語：カタカナ/英字揺れ両方対応
- 英語：US 英語統一、メタタグ EN-US 指定
- 検索ボリュームより購入意図を優先
