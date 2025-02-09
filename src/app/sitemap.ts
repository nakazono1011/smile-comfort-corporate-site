import { MetadataRoute } from "next";
import { getAllPostsForSitemap, getPosts } from "./(media)/media/api";

export const revalidate = 3600; // 1時間ごとに再生成

// URLの正規化のためのユーティリティ関数
function normalizeUrl(url: string): string {
  return url.replace(/([^:]\/)\/+/g, "$1").replace(/\/$/, "");
}

// サイトマップのエントリー型定義
type SitemapEntry = {
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  lastModified: Date;
  priority?: number;
  url: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!siteUrl) {
      throw new Error("NEXT_PUBLIC_SITE_URL is not defined");
    }

    // トップページのエントリーを追加
    const homePageEntry: SitemapEntry = {
      changefreq: "weekly",
      lastModified: new Date(),
      priority: 1.0,
      url: normalizeUrl(siteUrl),
    };

    // メディア記事の取得とURL生成
    const { totalPages } = await getPosts(); // ページネーション用の総ページ数取得
    const allPosts = await getAllPostsForSitemap(); // 全記事取得

    // 記事一覧ページのURL生成
    const mediaListUrls: SitemapEntry[] = Array.from(
      { length: totalPages },
      (_, i) => ({
        changefreq: "daily",
        lastModified: new Date(),
        priority: 0.8,
        url: normalizeUrl(`${siteUrl}/media${i === 0 ? "" : `?page=${i + 1}`}`),
      })
    );

    // 個別記事ページのURL生成
    const mediaUrls: SitemapEntry[] = allPosts.map((post) => ({
      changefreq: "weekly",
      lastModified: new Date(post.date),
      priority: 0.7,
      url: normalizeUrl(`${siteUrl}/media/${post.slug}`),
    }));

    // すべてのURLをマージして返却
    return [
      homePageEntry, // トップページを最初に追加
      ...mediaListUrls, // 記事一覧ページのURLを追加
      ...mediaUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    // エラー時は最低限の情報だけでもsitemapを返す
    return [
      {
        lastModified: new Date(),
        priority: 1.0,
        url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
    ];
  }
}
