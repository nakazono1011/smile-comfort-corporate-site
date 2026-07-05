/**
 * メディア記事 MDX の公開前バリデーション。
 * frontmatter スキーマ / slug=ファイル名 / AF URL ホワイトリスト / 開示行 /
 * 画像 URL 形式 / __TEMP__ 残骸 / author 固定 を機械チェックする。
 * 生成パイプライン (run-affiliate-article) の最終ゲート、および CI 用。
 * 使い方: npm run validate:articles
 */
// fallow-ignore-next-line code-duplication
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const CONTENT_ROOT = path.join(root, "src", "lib", "content");
const CATEGORIES = ["media", "proxy-scraping", "ec-oms", "password-manager", "hubspot"];
const LANGS = ["ja", "en"];

const REQUIRED_FIELDS = ["title", "date", "summary", "slug", "lang"];
const ALLOWED_PRODUCTS = ["1password", "brightdata", "nextengine"];

// config/affiliate.ts + product-*.md と一致させる正規 AF URL（ホスト → 許可 URL 群 / 対応 product）
const AFFILIATE_HOSTS = {
  "get.brightdata.com": {
    product: "brightdata",
    urls: ["https://get.brightdata.com/0cqcj8xp08fo"],
  },
  "base.next-engine.org": {
    product: "nextengine",
    urls: ["https://base.next-engine.org/account/?agent_code=MzEzNw"],
  },
  "1password.partnerlinks.io": {
    product: "1password",
    urls: [
      "https://1password.partnerlinks.io/sc-link",
      "https://1password.partnerlinks.io/dobcflhz59kl-d8wpd",
      "https://1password.partnerlinks.io/6dieu4x28dzi-gp0g2q",
    ],
  },
};

const DISCLOSURE = {
  ja: "本記事には PR",
  en: "affiliate links",
};

/** [text](url) の url を全部拾う */
const linkUrls = (body) =>
  [...body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);

const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};

// fallow-ignore-next-line complexity
async function main() {
  const errors = [];
  const warnings = [];
  let checked = 0;

  for (const lang of LANGS) {
    for (const category of CATEGORIES) {
      const dir = path.join(CONTENT_ROOT, lang, category);
      let files;
      try {
        files = await fs.readdir(dir);
      } catch {
        continue;
      }
      for (const file of files) {
        if (!file.endsWith(".mdx")) continue;
        checked++;
        const rel = path.join(lang, category, file);
        const raw = await fs.readFile(path.join(dir, file), "utf8");
        const { data, content } = matter(raw);
        const slugFromFile = file.replace(/\.mdx$/, "");
        const err = (m) => errors.push(`${rel}: ${m}`);
        const warn = (m) => warnings.push(`${rel}: ${m}`);

        // 1. 必須 frontmatter
        for (const f of REQUIRED_FIELDS) {
          if (!data[f]) err(`frontmatter '${f}' がない`);
        }
        // 2. slug = ファイル名 / lang = ディレクトリ
        if (data.slug && data.slug !== slugFromFile)
          err(`slug '${data.slug}' がファイル名 '${slugFromFile}' と不一致`);
        if (data.lang && data.lang !== lang)
          err(`lang '${data.lang}' がディレクトリ '${lang}' と不一致`);
        // 3. 日付
        for (const f of ["date", "updated"]) {
          if (data[f] && Number.isNaN(new Date(data[f]).getTime()))
            err(`${f} '${data[f]}' が不正な日付`);
        }
        // 4. product
        if (data.product && !ALLOWED_PRODUCTS.includes(data.product))
          err(`product '${data.product}' は許可外`);
        // 5. author 固定
        if (data.author && data.author !== "smile-comfort")
          err(`author '${data.author}' は smile-comfort 固定 (個人名禁止)`);
        // 6. __TEMP__ 残骸
        if (raw.includes("__TEMP__")) err(`__TEMP__ プレースホルダが残存`);
        // 7. 画像 URL 形式（frontmatter + 本文）
        for (const f of ["cover", "heroImage", "ogImage"]) {
          const v = data[f];
          if (v && !/^https:\/\/img\.smile-comfort\.com\//.test(String(v).split("?")[0]))
            err(`${f} が R2 絶対 URL でない: ${v}`);
        }
        if (/!\[[^\]]*\]\(\/images\//.test(content) || /src="\/images\//.test(content))
          err(`本文にローカル /images/ 相対パス画像がある (R2 絶対 URL にする)`);
        // 8. AF リンクのホワイトリスト + product 整合
        for (const url of linkUrls(content)) {
          const host = hostOf(url);
          const cfg = host && AFFILIATE_HOSTS[host];
          if (!cfg) continue; // 非 AF リンクは link_health 側の責務
          const bare = url.split("#")[0];
          if (!cfg.urls.includes(bare))
            err(`未登録の AF URL (別 ID 疑い): ${url}`);
          if (data.product && cfg.product !== data.product)
            err(`product='${data.product}' の記事に別製品 AF リンク: ${url}`);
        }
        // 9. 開示行（product 記事のみ必須）
        if (data.product) {
          const needle = DISCLOSURE[lang];
          if (needle && !raw.includes(needle))
            warn(`開示文 '${needle}' が本文末尾に見当たらない (冒頭はサイトが自動描画)`);
        }
        // 10. FAQ は frontmatter に持つ（product 記事）
        if (data.product && (!Array.isArray(data.faq) || data.faq.length === 0))
          warn(`frontmatter faq が空 (FAQPage JSON-LD が出ない)`);
      }
    }
  }

  console.log(`\nvalidate-articles: ${checked} files checked`);
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warnings:`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
  if (errors.length) {
    console.log(`\n✗ ${errors.length} errors:`);
    for (const e of errors) console.log(`  - ${e}`);
    console.log("");
    process.exit(1);
  }
  console.log(`\n✓ no errors\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
