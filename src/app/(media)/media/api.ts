import { notFound } from "next/navigation";

import { Post, PostDetail } from "./types";

// 1ページあたりの記事数を定数として定義
const POSTS_PER_PAGE = 15;

export async function getPosts(
  page: number = 1
): Promise<{ posts: Post[]; totalPages: number }> {
  // URLSearchParamsを使用してクエリパラメータを構築
  const params = new URLSearchParams({
    _embed: "",
    per_page: POSTS_PER_PAGE.toString(),
    page: page.toString(),
    status: "publish",
  });

  try {
    const res = await fetch(
      `https://xs876367.xsrv.jp/wp-json/wp/v2/posts?${params.toString()}`,
      {
        next: {
          revalidate: 3600,
          tags: ["posts"],
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }

    const posts = await res.json();
    const totalPosts = Number(res.headers.get("X-WP-Total")) || 0;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    return {
      posts,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], totalPages: 0 };
  }
}

/**
 * WordPressから総記事数を取得する
 */
export async function getTotalPosts(): Promise<number> {
  const res = await fetch(
    `https://xs876367.xsrv.jp/wp-json/wp/v2/posts?per_page=1`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch total posts count: ${res.status} ${res.statusText}`
    );
  }

  return Number(res.headers.get("X-WP-Total")) || 0;
}

/**
 * 静的生成するページのパラメータを生成する
 */
export async function generatePageParams() {
  try {
    const totalPosts = await getTotalPosts();
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const pagesToGenerate = Math.min(totalPages, 5);

    return Array.from({ length: pagesToGenerate }, (_, i) => ({
      searchParams: { page: (i + 1).toString() },
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/**
 * 特定の投稿を取得する
 */
export async function getPost(slug: string): Promise<PostDetail> {
  try {
    const res = await fetch(
      `https://xs876367.xsrv.jp/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      {
        next: {
          revalidate: 3600,
          tags: [`post-${slug}`],
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch post");
    }

    const posts = await res.json();
    if (!posts.length) {
      notFound();
    }

    return posts[0];
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    throw error;
  }
}

/**
 * 静的生成する記事のパラメータを生成する
 */
export async function generatePostParams() {
  try {
    const res = await fetch(
      "https://xs876367.xsrv.jp/wp-json/wp/v2/posts?per_page=100&status=publish"
    );
    const posts: Post[] = await res.json();

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error fetching posts for static generation:", error);
    return [];
  }
}

/**
 * サイトマップ生成用に全記事を取得する
 */
export async function getAllPostsForSitemap(): Promise<Post[]> {
  const statusParam =
    process.env.VERCEL_ENV === "production" ? "&status=publish" : "";

  try {
    // まず総記事数を取得
    const totalPosts = await getTotalPosts();
    const postsPerRequest = 100;
    const totalRequests = Math.ceil(totalPosts / postsPerRequest);

    // 必要な回数だけリクエストを並列実行
    const requests = Array.from({ length: totalRequests }, (_, i) =>
      fetch(
        `https://xs876367.xsrv.jp/wp-json/wp/v2/posts?_embed${statusParam}&per_page=${postsPerRequest}&page=${
          i + 1
        }`,
        {
          next: {
            revalidate: 3600,
            tags: ["posts-sitemap"],
          },
        }
      ).then((res) => res.json())
    );

    const results = await Promise.all(requests);
    return results.flat();
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error);
    return [];
  }
}
