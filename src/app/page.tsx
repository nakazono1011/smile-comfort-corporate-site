import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageEffects } from "@/components/lp/PageEffects";
import { DialStage } from "@/components/lp/dial/DialStage";
import { Hero } from "@/components/lp/sections/Hero";
import { Statement } from "@/components/lp/sections/Statement";
import { Services } from "@/components/lp/sections/Services";
import { Climax } from "@/components/lp/sections/Climax";
import { Scope } from "@/components/lp/sections/Scope";
import { Approach } from "@/components/lp/sections/Approach";
import { Works } from "@/components/lp/sections/Works";
import { Faq } from "@/components/lp/sections/Faq";
import { Company } from "@/components/lp/sections/Company";
import { Contact } from "@/components/lp/sections/Contact";
import { OG_IMAGE } from "@/config/company";
import { ProductsJsonLd } from "@/components/seo/JsonLd";

const title =
  "ECの課題をAIで解決｜出品・併売・問い合わせ対応・ページ改善｜合同会社スマイルコンフォート";
const description =
  "自社EC・国内モール・海外モールの課題を、AIと仕組みで解決します。出品業務、併売、問い合わせ対応、ページ改善まで、業務の棚卸しから開発・運用まで伴走する合同会社スマイルコンフォート。";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "合同会社スマイルコンフォート",
    url: "/",
    title,
    description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE.url],
  },
};

export default function Home() {
  return (
    <div className="sc-root min-h-screen" data-theme="light">
      <ProductsJsonLd />
      <PageEffects />
      <SiteHeader />
      <main>
        <DialStage>
          <Hero />
          <Statement />
          <Services />
          <Climax />
        </DialStage>
        <Scope />
        <Approach />
        <Works />
        <Faq />
        <Company />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
