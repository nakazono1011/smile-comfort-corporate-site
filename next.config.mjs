import createMDX from "@next/mdx";
import nextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        pathname: "/**",
        port: "",
      },
      {
        protocol: "http",
        hostname: "*",
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
  // Turbopack環境でのシリアライズエラーを回避するため、
  // next.config.mjs内でのremarkPlugins設定は一時的に無効化しています。
  // 実際のMDXコンテンツ（next-mdx-remote使用）のプラグイン設定は各ページコンポーネント内で行われています。
  options: {},
});

/** next-intl設定を適用 */
const withNextIntl = nextIntlPlugin("./src/i18n/request.ts");

/** 設定を合成してエクスポート */
export default withNextIntl(withMDX(baseConfig));
