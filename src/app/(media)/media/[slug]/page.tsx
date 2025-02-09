import { Metadata } from "next";

import MarkdownIt from "markdown-it";

import { generatePostParams, getPost } from "../api";
import { PostContent } from "./components/PostContent";
import { PostHeader } from "./components/PostHeader";
import { TableOfContents } from "./components/TableOfContents";
import { PostDetail } from "@/app/(media)/media/types";

// ページの動的/静的な振る舞いを制御
export const dynamic = "force-static";
export const dynamicParams = true; // generateStaticParamsで生成されていないパラメータの場合はISRで生成

// マークダウンパーサーの初期化
const md = new MarkdownIt({
  breaks: true,
  html: true,
  linkify: true,
  typographer: true,
  // シンタックスハイライトなどの追加プラグインもここで設定可能
});

// 動的メタデータの生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  const ogImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  // SEOメタ情報を優先使用
  const title = post.seo_meta?.title || post.title.rendered;
  const description =
    post.seo_meta?.meta_description ||
    post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    // 基本的なメタ情報
    title,

    // その他のメタ情報
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/media/${slug}`,
    },
    description,
    keywords: post.seo_meta?.meta_keywords,

    // OGP設定
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
      locale: "ja_JP",
      modifiedTime: post.seo_meta?.seo_update_time || post.modified,
      publishedTime: post.seo_meta?.seo_post_time || post.date,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "",
      type: "article",
    },

    // robots設定
    robots: {
      follow: !post.seo_meta?.is_nofollow,
      index: !post.seo_meta?.is_noindex,
    },

    // Twitter Card設定
    twitter: {
      title,
      card: "summary_large_image",
      description,
      images: ogImage ? [ogImage] : [],
      site: process.env.NEXT_PUBLIC_TWITTER_ID || "",
    },
  };
}

// 目次生成のためのヘルパー関数
function generateTableOfContents(content: string) {
  const headings: { id: string; level: number; text: string }[] = [];

  // h2とh3タグを検出する正規表現
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/g;
  let modifiedContent = content;
  let tocNumber = 1;

  // 見出しを検索して処理
  modifiedContent = modifiedContent.replace(
    headingRegex,
    (match, level, text) => {
      // HTMLタグを除去してテキストのみを抽出
      const plainText = text.replace(/<[^>]*>/g, "");

      // 連番でIDを生成
      const id = `toc${tocNumber}`;

      // 目次データを追加
      headings.push({
        id,
        level: parseInt(level),
        text: plainText,
      });

      // カウンターをインクリメント
      tocNumber++;

      // 元のh2/h3タグにIDを付与
      return `<h${level} id="${id}">${text}</h${level}>`;
    }
  );

  return { headings, modifiedContent };
}

// JsonLdコンポーネントの追加
function JsonLd({ post }: { post: PostDetail }) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo_meta?.title || post.title.rendered,
    description:
      post.seo_meta?.meta_description ||
      post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 160),
    image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    datePublished: post.seo_meta?.seo_post_time || post.date,
    dateModified: post.seo_meta?.seo_update_time || post.modified,
    author: {
      "@type": "Person",
      name: "Keisuke Nakazono",
    },
    publisher: {
      "@type": "Organization",
      name: "合同会社スマイルコンフォート",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`, // サイトのロゴURL
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/media/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  );
}

// 投稿詳細ページコンポーネント
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  // WordPressの投稿内容をマークダウン変換し、目次を生成
  const content = post.content.rendered.includes("```")
    ? md.render(post.content.rendered)
    : post.content.rendered;

  const { headings, modifiedContent } = generateTableOfContents(content);

  return (
    <>
      <JsonLd post={post} />
      <article className="container mx-auto max-w-4xl px-4 py-8 mt-16">
        <PostHeader post={post} />
        <TableOfContents headings={headings} />
        <PostContent
          content={modifiedContent}
          className="prose-headings:scroll-mt-20"
        />
      </article>
    </>
  );
}

export const generateStaticParams = generatePostParams;
