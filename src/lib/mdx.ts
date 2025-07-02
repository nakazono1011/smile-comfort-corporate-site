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
  category?: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "src", "lib", "content");

// 対応するカテゴリディレクトリ
const CATEGORIES = [
  "media",
  "proxy-scraping",
  "ec-oms",
  "password-manager",
  "hubspot",
];

export async function getPostMeta(lang: "ja" | "en"): Promise<PostMeta[]> {
  const allPosts: PostMeta[] = [];

  for (const category of CATEGORIES) {
    const dir = path.join(CONTENT_ROOT, lang, category);

    try {
      const files = await fs.readdir(dir);

      for (const filename of files) {
        if (filename.endsWith(".mdx")) {
          const source = await fs.readFile(path.join(dir, filename), "utf8");
          const { data } = matter(source);

          // カテゴリ情報を追加
          const postData = {
            ...data,
            category,
            slug: filename.replace(".mdx", ""),
          } as PostMeta;

          allPosts.push(postData);
        }
      }
    } catch {
      // ディレクトリが存在しない場合はスキップ
      console.warn(`Directory ${dir} not found, skipping...`);
    }
  }

  // 日付でソート
  return allPosts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPost(sourceSlug: string, lang: "ja" | "en") {
  // 全カテゴリから該当するslugのファイルを検索
  for (const category of CATEGORIES) {
    try {
      const file = path.join(CONTENT_ROOT, lang, category, `${sourceSlug}.mdx`);
      const mdxSource = await fs.readFile(file, "utf8");
      const matter_result = matter(mdxSource);

      // カテゴリ情報を追加
      matter_result.data.category = category;

      return matter_result;
    } catch {
      // ファイルが見つからない場合は次のカテゴリを試す
      continue;
    }
  }

  // 全カテゴリで見つからない場合はエラー
  throw new Error(`Post with slug "${sourceSlug}" not found in any category`);
}

export async function getPostsByCategory(
  category: string,
  lang: "ja" | "en"
): Promise<PostMeta[]> {
  const dir = path.join(CONTENT_ROOT, lang, category);

  try {
    const files = await fs.readdir(dir);

    const posts = await Promise.all(
      files
        .filter((filename) => filename.endsWith(".mdx"))
        .map(async (filename) => {
          const source = await fs.readFile(path.join(dir, filename), "utf8");
          const { data } = matter(source);
          return {
            ...data,
            category,
            slug: filename.replace(".mdx", ""),
          } as PostMeta;
        })
    );

    return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  } catch {
    console.warn(`Category ${category} not found, returning empty array`);
    return [];
  }
}
