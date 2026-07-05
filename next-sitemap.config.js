/** @type {import('next-sitemap').IConfig} */
const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

const fromEnv = process.env.NEXT_PUBLIC_BASE_URL;
const SITE_URL =
  fromEnv && !fromEnv.includes("localhost")
    ? fromEnv
    : "https://www.smile-comfort.com";

// 記事はカテゴリディレクトリ横断で slug 検索され、URL は常に /media/<slug>（ja）/ /en/media/<slug>（en）。
const CONTENT_ROOT = path.join(__dirname, "src", "lib", "content");
const CONTENT_CATEGORIES = [
  "media",
  "proxy-scraping",
  "ec-oms",
  "password-manager",
  "hubspot",
];

const toIso = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** URL パス → 記事の updated||date（ISO）。全 URL 一律 new Date() だと lastmod が無意味になるため。 */
// fallow-ignore-next-line complexity
const buildLastmodMap = () => {
  const map = {};
  for (const lang of ["ja", "en"]) {
    for (const category of CONTENT_CATEGORIES) {
      const dir = path.join(CONTENT_ROOT, lang, category);
      let files;
      try {
        files = fs.readdirSync(dir);
      } catch {
        continue;
      }
      for (const file of files) {
        if (!file.endsWith(".mdx")) continue;
        const slug = file.replace(/\.mdx$/, "");
        let data = {};
        try {
          data = matter(fs.readFileSync(path.join(dir, file), "utf8")).data || {};
        } catch {
          continue;
        }
        const iso = toIso(data.updated || data.date);
        if (!iso) continue;
        const urlPath = lang === "en" ? `/en/media/${slug}` : `/media/${slug}`;
        map[urlPath] = iso;
      }
    }
  }
  return map;
};

let lastmodByPath = null;

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: false,
  changefreq: "weekly",
  sitemapSize: 7000,
  exclude: ["/api/*"],
  transform: async (config, urlPath) => {
    if (lastmodByPath === null) lastmodByPath = buildLastmodMap();
    return {
      loc: urlPath,
      changefreq: config.changefreq,
      priority: urlPath === "/" ? 1.0 : 0.7,
      lastmod: lastmodByPath[urlPath] || new Date().toISOString(),
    };
  },
};
