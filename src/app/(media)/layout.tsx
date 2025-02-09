import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="container mx-auto max-w-7xl">{children}</div>
      <SiteFooter />
    </div>
  );
}
