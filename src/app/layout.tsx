import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "合同会社スマイルコンフォート | Smile Comfort LLC",
  description:
    "DXでビジネスを加速させませんか？生成AI・Webアプリ開発・データ分析で、売上アップと業務効率化を実現。個人事業主・中小企業の経営者様に、確かな実績と豊富な経験で、コスト効果の高いDXソリューションをご提案。まずはお気軽にご相談ください。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">{children}</main>
        </div>
        <GoogleAnalytics gaId="G-8HRNH9FQ9G" />
      </body>
    </html>
  );
}
