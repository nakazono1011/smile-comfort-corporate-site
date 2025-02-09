/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        hostname: "xs876367.xsrv.jp",
        pathname: "/**",
        port: "",
        protocol: "https",
      },
    ],
  },
};

module.exports = nextConfig;
