import { HeroContent } from "./client/HeroContent";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden flex flex-col">
      <HeroContent />
    </section>
  );
}
