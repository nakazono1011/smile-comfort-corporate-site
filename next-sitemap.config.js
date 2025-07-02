/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
  generateRobotsTxt: true,
  changefreq: "weekly",
  sitemapSize: 7000,
  exclude: ["/api/*"],
  alternateRefs: [
    {
      href: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      hreflang: "ja",
    },
    {
      href: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/en`,
      hreflang: "en",
    },
  ],
};
