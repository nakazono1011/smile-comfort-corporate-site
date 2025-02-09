import { Metadata } from "next";
import { notFound } from "next/navigation";

import Pagination from "@/components/Pagination";

import { generatePageParams, getPosts } from "./api";
import { PostList } from "./components/PostList";

export const generateStaticParams = generatePageParams;

export const metadata: Metadata = {
  title: "記事一覧",
  description:
    "スマイルコンフォートのメディアページです。最新の技術的なノウハウを集約しお届けします。",
  openGraph: {
    title: "記事一覧",
    description:
      "スマイルコンフォートのメディアページです。最新の技術的なノウハウを集約しお届けします。",
  },
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  try {
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;
    const { posts, totalPages } = await getPosts(currentPage);

    if (posts.length === 0) {
      notFound();
    }

    return (
      <div className="mx-auto p-8 min-h-dvh">
        <h1 className="mb-8 text-3xl font-bold">記事一覧</h1>
        <PostList posts={posts} />
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}

export const dynamic = "force-dynamic";
