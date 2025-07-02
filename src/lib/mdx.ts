import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface PostMeta {
  title: string;
  date: string;
  summary: string;
  slug: string;
  lang: "ja" | "en";
  tags?: string[];
}

const CONTENT_ROOT = path.join(process.cwd(), "content");

export async function getPostMeta(lang: "ja" | "en"): Promise<PostMeta[]> {
  const dir = path.join(CONTENT_ROOT, lang, "media");
  const files = await fs.readdir(dir);

  return Promise.all(
    files.map(async (filename) => {
      const source = await fs.readFile(path.join(dir, filename), "utf8");
      const { data } = matter(source);
      return data as PostMeta;
    })
  ).then((posts) =>
    posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  );
}

export async function getPost(sourceSlug: string, lang: "ja" | "en") {
  const file = path.join(CONTENT_ROOT, lang, "media", `${sourceSlug}.mdx`);
  const mdxSource = await fs.readFile(file, "utf8");
  return matter(mdxSource);
}
