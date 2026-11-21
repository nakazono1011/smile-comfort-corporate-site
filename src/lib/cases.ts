import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { CONTACT_TOPICS, type ContactTopic } from "@/components/lp/content";
import { extractFaqsFromMdx, type FaqPair } from "@/lib/mdx";

/** 事例1件ぶんの記録。事例を足すときは src/lib/content/ja/cases/<slug>.md と public/cases/<slug>/ の図を置く */
export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  updated: string;
  contactTopic: ContactTopic;
  /** 図の絶対パス (public/ 配下) */
  figureSrc: string;
  faqs: FaqPair[];
  /** 相談ボタンより前の本文 (図は絶対パスに差し替え済み) */
  body: string;
  /** 相談ボタンより後の本文 (最終更新日の行) */
  footer: string;
}

const CASES_DIR = path.join(process.cwd(), "src", "lib", "content", "ja", "cases");
const CONSULT_LINE_RE = /^\[相談ボタン:\s*(.+?)\]\s*$/m;

const isContactTopic = (v: unknown): v is ContactTopic =>
  CONTACT_TOPICS.some((t) => t === v);

export async function listCaseSlugs(): Promise<string[]> {
  const files = await fs.readdir(CASES_DIR).catch(() => []);
  return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

export async function getCase(slug: string): Promise<CaseStudy | null> {
  const source = await fs
    .readFile(path.join(CASES_DIR, `${slug}.md`), "utf8")
    .catch(() => null);
  if (source === null) return null;

  const { data, content } = matter(source);
  const { title, description, figure, contact_topic } = data;
  const updated =
    data.updated instanceof Date
      ? data.updated.toISOString().slice(0, 10)
      : String(data.updated);
  if (!title || !description || !figure || !data.updated) {
    throw new Error(`case ${slug}: title/description/updated/figure は必須`);
  }
  if (!isContactTopic(contact_topic)) {
    throw new Error(`case ${slug}: contact_topic が CONTACT_TOPICS にない: ${contact_topic}`);
  }

  const consult = CONSULT_LINE_RE.exec(content);
  if (!consult || consult[1] !== contact_topic) {
    throw new Error(`case ${slug}: 本文の相談ボタンが無いか contact_topic と違う`);
  }

  const figureSrc = `/cases/${slug}/${figure}.png`;
  const body = content
    .slice(0, consult.index)
    .replace(/\]\(([A-Z]-[A-Z]{2}-\d{2})\)/g, (_, id: string) => `](/cases/${slug}/${id}.png)`)
    .trimEnd();

  return {
    slug,
    title,
    description,
    updated,
    contactTopic: contact_topic,
    figureSrc,
    faqs: extractFaqsFromMdx(body),
    body,
    footer: content.slice(consult.index + consult[0].length).trim(),
  };
}

/** 相談ボタンの行き先。通常のリンクで全読み込みさせ、トップページが ?topic= と UTM を初回読み込みで拾えるようにする */
export const consultHref = (topic: ContactTopic) =>
  `/?topic=${encodeURIComponent(topic)}#contact`;
