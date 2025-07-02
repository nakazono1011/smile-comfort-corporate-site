import { getPostMeta, PostMeta } from "@/lib/mdx";
import Link from "next/link";

export const generateMetadata = () => ({ title: "Media List" });
export const revalidate = 60; // ISR: 60 秒

export default async function MediaList() {
  const posts = await getPostMeta("en");

  return (
    <main className="prose mx-auto">
      <h1>Latest Articles</h1>
      <ul>
        {posts.map((p: PostMeta) => (
          <li key={p.slug}>
            <Link href={`/en/media/${p.slug}`}>{p.title}</Link>
            <small className="block opacity-70">{p.date}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
