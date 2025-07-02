/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  generateRobotsTxt: true,

  // SEO最適化のための基本設定
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  autoLastmod: true,

  // SEOに不要なページを除外
  exclude: ["/admin/*", "/private/*", "/api/*", "/404", "/500"],

  // ページタイプ別の優先度とクロール頻度設定
  transform: async (config, path) => {
    // トップページ
    if (path === "/") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // メディア記事
    if (path.startsWith("/media/")) {
      return {
        loc: path,
        changefreq: "daily",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  // robots.txt最適化
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/private", "/api"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
  },
};
