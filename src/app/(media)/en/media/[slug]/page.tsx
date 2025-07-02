import { getPost, getPostMeta, type PostMeta } from "@/lib/mdx";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getPostMeta("en");
  return posts.map((p: PostMeta) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getPost(slug, "en");
  return { title: data.title, description: data.summary };
}

export const revalidate = 60;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { content, data } = await getPost(slug, "en");
  if (!data) notFound();

  const { content: mdxContent } = await compileMDX({
    source: content,
    components: { Link },
  });

  return (
    <article className="prose mx-auto">
      <h1>{data.title}</h1>
      <time dateTime={data.date}>{data.date}</time>
      {mdxContent}
      <hr />
      <Link href="/en/media" className="text-sm">
        ← 記事一覧へ
      </Link>
    </article>
  );
}
