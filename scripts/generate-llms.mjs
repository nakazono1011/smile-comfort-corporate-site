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
  `About: EC × AI で、自社EC・国内モール・海外モールの課題を解決（出品業務・併売・問い合わせ対応・ページ改善）。自社プロダクト CataMap / Catamap Reuse DB の開発・運営`,
  ``,
  `## サービス (EC × AI の業務改善支援。自社EC・国内モール・海外モールに対応)`,
  // 文言は src/components/lp/content.ts の SERVICES と揃える
  `- 出品業務: 商品名・説明文・画像から、売り場ごとのカテゴリや属性をAIで判定して入力。説明文の下書き、海外モール向けの翻訳、モール別CSVの作成まで自動化 (${baseUrl}/#service-listing)`,
  `- 併売: 自社EC・楽天市場・Yahoo!ショッピング・Amazon・海外モールの在庫と受注をひとつの流れにまとめる。一元管理ツールの導入から連携開発まで (${baseUrl}/#service-channel)`,
  `- 問い合わせ対応: 問い合わせの自動仕分けと、注文情報を参照した返信の下書き。多言語の問い合わせにも対応。送信前に担当者が確認する運用が基本 (${baseUrl}/#service-support)`,
  `- ページ改善: 商品ページ・レビュー・競合ページをAIで分析し、改善点を優先度順に提案。タイトル・説明文の改善案から効果の確認まで (${baseUrl}/#service-page)`,
  `- 相談窓口: ${baseUrl}/#contact`,
  ``,
  `## 主な自社プロダクト`,
  `- CataMap: https://catamap.app/ — ECモール向けAIタグ自動補完`,
  `- Catamap Reuse DB: https://reuse.catamap.app/ — 中古の相場検索。AI が型番・状態・傷・付属品・素材の違いを一点ずつ解析して揃え、本当に比較できる個体から相場を出す`,
  ``,
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
