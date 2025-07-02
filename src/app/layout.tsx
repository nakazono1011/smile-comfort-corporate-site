import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GoogleTagManager } from "@next/third-parties/google";
import Providers from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "合同会社スマイルコンフォート | Smile Comfort LLC",
  description:
    "DXでビジネスを加速させませんか？生成AI・Webアプリ開発・データ分析で、売上アップと業務効率化を実現。個人事業主・中小企業の経営者様に、確かな実績と豊富な経験で、コスト効果の高いDXソリューションをご提案。まずはお気軽にご相談ください。",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? "ja";

  return (
    <html lang={locale}>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            <Providers locale={locale}>{children}</Providers>
          </main>
        </div>
      </body>
      {process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && (
        <>
          <GoogleAnalytics gaId="G-8HRNH9FQ9G" />
          <GoogleTagManager gtmId="GTM-KCSG3QM2" />
        </>
      )}
    </html>
  );
}
