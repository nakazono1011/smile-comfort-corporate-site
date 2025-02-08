import { HeroContent } from "./client/HeroContent";

export function HeroSection() {
  return (
    <section className="relative h-[600px] overflow-hidden sm:h-[800px] md:h-[1000px] lg:h-[1200px]">
      <HeroContent />
    </section>
  );
}
