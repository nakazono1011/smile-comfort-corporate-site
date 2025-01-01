import { HeroSection } from "@/components/sections/Hero";
import { MissionSection } from "@/components/sections/Mission";
// import { ValuesSection } from "@/components/sections/Values";
import { ServicesSection } from "@/components/sections/Services";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CompanySection } from "@/components/sections/Company";
import { ContactSection } from "@/components/sections/Contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <SiteHeader />
      <HeroSection />
      <MissionSection />
      {/* <ValuesSection /> */}
      <ServicesSection />
      <CompanySection />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
