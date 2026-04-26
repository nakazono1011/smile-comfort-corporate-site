import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/Hero";
import { MissionSection } from "@/components/sections/Mission";
import { ServicesSection } from "@/components/sections/Services";
import { ProductsSection } from "@/components/sections/Products";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CompanySection } from "@/components/sections/Company";
import { ContactSection } from "@/components/sections/Contact";
import { OG_IMAGE } from "@/config/company";

export const metadata: Metadata = {
  title: "アイデアをプロダクトに | 合同会社スマイルコンフォート",
  description:
    "AIでアイデアが形になる時代。自社プロダクト開発から受託AI開発・EC運営支援まで、少数精鋭のエンジニアチームが構想を現実にする合同会社スマイルコンフォート。",
  openGraph: {
    title: "アイデアをプロダクトに | 合同会社スマイルコンフォート",
    description:
      "自社プロダクト開発から受託開発まで。少数精鋭のエンジニアチームが構想を現実にします。",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProductsSection />
        <MissionSection />
        <CompanySection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
