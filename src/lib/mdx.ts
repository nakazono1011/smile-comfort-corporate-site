import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type AffiliateProduct = "1password" | "brightdata" | "nextengine";

export interface FaqItem {
  q: string;
  a: string;
}

export interface PostMeta {
  title: string;
  date: string;
  summary: string;
  slug: string;
  lang: "ja" | "en";
  tags?: string[];
  category?: string;
  cover?: string;
  updated?: string;
  readTime?: number;
  author?: string;
  ogImage?: string;
  heroImage?: string;
  product?: AffiliateProduct;
  featured?: boolean;
  related?: string[];
  xPosts?: string[];
  faq?: FaqItem[];
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

export interface GetPostMetaOptions {
  /** featured:true を先頭に持ち上げる */
  featuredFirst?: boolean;
  /** カテゴリで絞り込む */
  category?: string;
}

export async function getPostMeta(
  lang: "ja" | "en",
  options: GetPostMetaOptions = {}
): Promise<PostMeta[]> {
  const allPosts: PostMeta[] = [];

  for (const category of CATEGORIES) {
    if (options.category && options.category !== category) continue;
    const dir = path.join(CONTENT_ROOT, lang, category);

    try {
      const files = await fs.readdir(dir);

      for (const filename of files) {
        if (filename.endsWith(".mdx")) {
          const source = await fs.readFile(path.join(dir, filename), "utf8");
          const { data } = matter(source);

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
    }
  }

  const sorted = allPosts.sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

  if (options.featuredFirst) {
    const featured = sorted.filter((p) => p.featured);
    const rest = sorted.filter((p) => !p.featured);
    return [...featured, ...rest];
  }

  return sorted;
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

export interface FaqPair {
  question: string;
  answer: string;
}

const FAQ_HEADING_RE =
  /^##\s+(?:よくある質問|FAQ\b|Frequently\s+Asked\s+Questions\b)/i;
const FAQ_QUESTION_PREFIX_RE = /^Q\d+[.\s、]\s*/i;
const FAQ_ANSWER_MAX = 8000;

/** MDX本文から「よくある質問」セクションの Q/A を抽出（FAQPage JSON-LD 用） */
export function extractFaqsFromMdx(content: string): FaqPair[] {
  const faqs: FaqPair[] = [];
  let inFaq = false;
  let question: string | null = null;
  let answerLines: string[] = [];

  const flush = () => {
    if (!question) return;
    const answer = normalizeFaqAnswer(answerLines.join("\n"));
    if (answer) faqs.push({ question: question.trim(), answer });
    question = null;
    answerLines = [];
  };

  for (const line of content.split(/\r?\n/)) {
    if (!inFaq) {
      if (FAQ_HEADING_RE.test(line)) inFaq = true;
      continue;
    }

    if (line.startsWith("## ")) {
      flush();
      break;
    }

    if (line.startsWith("### ")) {
      flush();
      const raw = line.slice(4).trim();
      question = raw.replace(FAQ_QUESTION_PREFIX_RE, "").trim() || raw;
      continue;
    }

    if (question) answerLines.push(line);
  }
  flush();
  return faqs;
}

function normalizeFaqAnswer(raw: string): string {
  const stripped = raw
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!stripped) return "";
  return stripped.length > FAQ_ANSWER_MAX
    ? `${stripped.slice(0, FAQ_ANSWER_MAX - 3)}...`
    : stripped;
}

/**
 * FAQPage JSON-LD 用の Q/A を解決する。
 * 生成パイプラインは FAQ を frontmatter `faq`（{q, a}[]）に格納し本文には書かないため、
 * frontmatter を最優先し、無い場合のみ本文の「よくある質問」セクションから抽出する。
 */
export function resolveFaqs(post: PostMeta, content: string): FaqPair[] {
  if (post.faq && post.faq.length > 0) {
    return post.faq
      .filter((f) => f?.q && f?.a)
      .map((f) => ({ question: f.q.trim(), answer: f.a.trim() }));
  }
  return extractFaqsFromMdx(content);
}
