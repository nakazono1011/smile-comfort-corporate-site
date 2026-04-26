/**
 * 全MDXのメタを集約し public/llms.txt を生成（LLM/AIクローラ向けのサイト概要）
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const fromEnv = process.env.NEXT_PUBLIC_BASE_URL;
const baseUrl =
  fromEnv && !fromEnv.includes("localhost")
    ? fromEnv
    : "https://www.smile-comfort.com";

async function readPosts(lang, subdir) {
  const dir = path.join(root, "src", "lib", "content", lang, subdir);
  const files = (await fs.readdir(dir).catch(() => [])).filter((f) =>
    f.endsWith(".mdx"),
  );
  const out = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    out.push({
      slug: file.replace(".mdx", ""),
      title: data.title,
      summary: data.summary,
      date: data.date,
      tags: data.tags,
    });
  }
  return out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

const ja = await readPosts("ja", "media");
const en = await readPosts("en", "media");

const lines = [
  `# 合同会社スマイルコンフォート (Smile Comfort LLC)`,
  ``,
  `Base URL: ${baseUrl}`,
  `About: Web開発、データ分析、EC支援、自社SaaS（CataMap / Tra-bell 等）`,
  ``,
  `## 主な自社プロダクト`,
  `- CataMap: https://catamap.app/ — ECモール向けAIタグ自動補完`,
  `- Tra-bell: https://www.tra-bell.com/ — ホテル価格監視`,
  `## 日本語メディア (${ja.length}件)`,
  ...ja.map((p) =>
    `- [${p.title}](${baseUrl}/media/${p.slug}): ${p.summary || ""}`.trim(),
  ),
  ``,
  `## English media (${en.length} articles)`,
  ...en.map((p) =>
    `- [${p.title}](${baseUrl}/en/media/${p.slug}): ${p.summary || ""}`.trim(),
  ),
  ``,
  `## LLM / retrieval`,
  `This file lists canonical article URLs and summaries for machine-readable context.`,
  `Sitemap: ${baseUrl}/sitemap.xml`,
];

const outPath = path.join(root, "public", "llms.txt");
await fs.writeFile(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath} (${lines.length} lines)`);
