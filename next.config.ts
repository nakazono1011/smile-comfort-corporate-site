import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import nextIntlPlugin from "next-intl/plugin";
import remarkGfm from "remark-gfm";

const baseConfig: NextConfig = {
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

  // MDX設定
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["next-mdx-remote"],
};

/** MDXラッパーを用意 */
const withMDX = createMDX({
  options: { remarkPlugins: [remarkGfm] },
});

/** next-intl設定を適用 */
const withNextIntl = nextIntlPlugin("./src/i18n/request.ts");

/** 設定を合成してエクスポート */
export default withNextIntl(withMDX(baseConfig));
