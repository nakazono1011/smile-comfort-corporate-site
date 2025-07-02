// next.config.mjs
import { createMDX } from "@next/mdx"; // MDX プラグイン
import nextIntlPlugin from "next-intl/plugin";
import remarkGfm from "remark-gfm";

const baseConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xs876367.xsrv.jp",
        pathname: "/**",
        port: "",
      },
    ],
  },

  // --- 追加 ---
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: { mdxRs: true },

  i18n: {
    locales: ["ja", "en"],
    defaultLocale: "ja",
    localeDetection: true,
  },
};

/** 2. MDX ラッパーを用意 */
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: { remarkPlugins: [remarkGfm] },
});

/** 3. MDX → next-intl の順に合成してエクスポート */
export default nextIntlPlugin(withMDX(baseConfig));
