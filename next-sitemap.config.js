/** @type {import('next-sitemap').IConfig} */
const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://smilecomfort.jp";

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: false,
  changefreq: "weekly",
  sitemapSize: 7000,
  exclude: ["/api/*"],
  transform: async (config, path) => ({
    loc: path,
    changefreq: config.changefreq,
    priority: path === "/" ? 1.0 : 0.7,
    lastmod: new Date().toISOString(),
  }),
};
