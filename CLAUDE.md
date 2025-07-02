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

# claude.md

# ─────────────────────────────────────────────────────────────────────────────

# PURPOSE

# ▸ Tell Claude\* exactly how to turn each row of the topic-cluster spreadsheet

# into a publish-ready MDX article for our Next.js 15 media section

# ▸ \*Claude = Anthropic “Claude 3.5 Sonnet (code)” model

# WHEN YOU CALL CLAUDE

# 1. Give ONE spreadsheet row (or a custom prompt) + the locale (ja / en)

# 2. Attach this claude.md file so Claude knows the house style

# 3. Claude should answer only with the .mdx file content (no explanations)

# ─────────────────────────────────────────────────────────────────────────────

# 1. FILE & FOLDER RULES

# ─────────────────────────────────────────────────────────────────────────────

# • Output file path …… /lib/content/{locale}/media/{slug}.mdx

# • Filename must exactly match ‹slug› column

# • Images: /public/images/{slug}/{image-name}.webp (Claude ⇒ Playwright MCP)

# • Use relative image paths in MDX: ![alt](/images/{slug}/{image-name}.webp)

# • Locale:

# ja → default site root → URL = /media/{slug}

# en → sub-dir → URL = /en/media/{slug}

# ─────────────────────────────────────────────────────────────────────────────

# 2. FRONT-MATTER TEMPLATE

# ─────────────────────────────────────────────────────────────────────────────

# (Claude must fill every field. Keep order.)

#

# ---

# title: "<JP or EN title>"

# date: "YYYY-MM-DD"

# summary: "<120 chars max – eye-catch blurb>"

# slug: "<slug>"

# lang: "<ja | en>"

# tags: ["<Primary Keyword JP/EN>", "<Intent>", "<Product>", "<Tool>"]

# cover: "/images/<slug>/cover.webp"

# wordCountTarget: <pillar ? 1700 : 1100>

# pillarSlug: "<parent pillar slug>" # empty for pillar itself

# ---

# ─────────────────────────────────────────────────────────────────────────────

# 3. ARTICLE LAYOUT (Claude follows this outline)

# ─────────────────────────────────────────────────────────────────────────────

# ## <H1 automatically rendered from title>

#

# ### 1. Lead-in (150-200 words)

# • Hook + Pain point + Promise

#

# ### 2. Table of Contents <!--omit if < 800 words-->

# <!-- mdx TOC plugin will pick up headings -->

#

# ### 3. Body Sections

# • 3-7 H2 blocks

# • Each H2 → 2-4 H3 sub-points

# • Use ordered / unordered lists where it helps readability

#

# ### 4. Practical Example or Mini-Case Study

# • Code, CLI, screenshot, KPI graphic etc.

#

# ### 5. FAQ (3-5 Q&A)

#

# ### 6. Conclusion & CTA

# • CTA = “無料 30 分相談” OR “Try Bright Data free” etc. (match product)

#

# ### 7. Footnotes (Markdown footnote syntax)

# [^1]: Official docs URL

# [^2]: Industry report URL

#

# > Internal Links

# > — Mention the parent pillar once in intro (“詳しくは〈link〉を参照”)

# > — Link 2 sibling cluster articles if relevant (`/media/<slug>` or `/en/...`)

# ─────────────────────────────────────────────────────────────────────────────

# 4. PLAYWRIGHT MCP IMAGE DIRECTIVES

# ─────────────────────────────────────────────────────────────────────────────

# • Claude must embed _at least 2_ images:

# 1. cover.webp → hero banner (1200×630 max)

# 2. 1+ inline charts / screenshots

# • For each image use this MDX directive:

#

# ```<PlaywrightMCP>

# url: "https://<target-page>"

# selector: "<css or xpath or viewport>"

# saveAs: "01-pricing-table.webp"

# width: 1200

# height: 630

# alt: "Bright Data official pricing table 2025"

# caption: "Bright Data pricing as of 2025-07"

# ```

#

# • Claude must reference ‹saveAs› in the article body via

# `![Bright Data pricing table](/images/<slug>/01-pricing-table.webp)`

#

# • If a live screenshot is impossible, Claude generates a

# remark-compatible diagram block (mermaid) **instead** of an image.

# ─────────────────────────────────────────────────────────────────────────────

# 5. STYLE GUIDE (EN & JA)

# ─────────────────────────────────────────────────────────────────────────────

# • Tone: authoritative yet friendly, no fluff, active voice.

# • Code blocks: fenced triple back-ticks with language (`bash`, `python`, etc.)

# • Use full-width punctuation in Japanese; half-width in English.

# • Translate proper nouns consistently (see /glossary.json if provided).

# • Quote official docs, academic papers, or ISO specs with footnote citations.

# • Avoid passive “と思われる”. Assert with data or cite source.

#

# SEO on-page:

# • Primary keyword appears in H1, first 100 words, 1 sub-heading,

# file name, and cover alt text.

# • Meta description auto uses `summary`.

#

# Accessibility:

# • Every image must have meaningful `alt`.

# • Use semantic headings hierarchy (no H4 if no H3 above).

#

# Length:

# • Pillar → 1600-2000 words (wordCountTarget 1700)

# • Cluster → 900-1300 words (wordCountTarget 1100)

#

# ─────────────────────────────────────────────────────────────────────────────

# 6. HOW TO PROMPT CLAUDE (example)

# ─────────────────────────────────────────────────────────────────────────────

# 「以下の行で記事を書いて。locale は ja。claude.md に従え」

#

# Bright Data コスト最適化テクニック, Cost Optimization Tips for Bright Data, Bright Data コスト, bright data cost optimization, Low, How-to, cost-optimization-tips-for-bright-data

#

# Claude の返答 → **ONLY** the resulting `.mdx` file content.

# ─────────────────────────────────────────────────────────────────────────────

# 7. DO NOTS

# ─────────────────────────────────────────────────────────────────────────────

# ✗ No external explanations, no “Here is your file” preamble

# ✗ No raw screenshot binaries—only Playwright MCP directives

# ✗ Do not break the front-matter format

# ✗ No links to non-HTTPS sources

#

# ─────────────────────────────────────────────────────────────────────────────

# END OF claude.md

# ─────────────────────────────────────────────────────────────────────────────

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
