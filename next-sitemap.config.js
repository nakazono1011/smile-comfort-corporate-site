/** @type {import('next-sitemap').IConfig} */
const fromEnv = process.env.NEXT_PUBLIC_BASE_URL;
const SITE_URL =
  fromEnv && !fromEnv.includes("localhost")
    ? fromEnv
    : "https://www.smile-comfort.com";

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
