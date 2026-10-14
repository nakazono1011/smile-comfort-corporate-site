import type { Metadata } from "next";
import { Archivo, Murecho, Outfit, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import Providers from "@/app/providers";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { ANALYTICS, BASE_URL, OG_IMAGE } from "@/config/company";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const murecho = Murecho({
  subsets: ["latin"],
  variable: "--font-jp-display",
  display: "swap",
  weight: ["700", "800"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-wide",
  display: "swap",
  axes: ["wdth"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "合同会社スマイルコンフォート | ECの課題をAIで解決",
    template: "%s | 合同会社スマイルコンフォート",
  },
  description:
    "出品業務、併売、問い合わせ対応、ページ改善。ECの現場で毎日くり返す作業を、AIと仕組みで軽くする合同会社スマイルコンフォート。業務の棚卸しから開発・運用まで伴走します。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    alternateLocale: "en_US",
    siteName: "合同会社スマイルコンフォート",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${outfit.variable} ${zenKaku.variable} ${murecho.variable} ${archivo.variable}`}
    >
      <head>
        <OrganizationJsonLd />
      </head>
      <body className={zenKaku.className} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
            <Providers locale="ja">{children}</Providers>
          </div>
        </div>
        {process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && (
          <GoogleTagManager gtmId={ANALYTICS.gtmId} />
        )}
      </body>
    </html>
  );
}
