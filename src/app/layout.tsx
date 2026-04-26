import type { Metadata } from "next";
import { Outfit, Zen_Kaku_Gothic_New } from "next/font/google";
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

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "合同会社スマイルコンフォート | Web開発・データ分析・EC支援のDXパートナー",
    template: "%s | 合同会社スマイルコンフォート",
  },
  description:
    "DXでビジネスを加速させませんか？生成AI・Webアプリ開発・データ分析で、売上アップと業務効率化を実現。個人事業主・中小企業の経営者様に、確かな実績と豊富な経験で、コスト効果の高いDXソリューションをご提案。まずはお気軽にご相談ください。",
  alternates: {
    canonical: "/",
    languages: { ja: "/", en: "/en" },
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
    <html lang="ja" className={`${outfit.variable} ${zenKaku.variable}`}>
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
