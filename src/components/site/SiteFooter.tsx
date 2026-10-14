import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { COMPANY_INFO, EXTERNAL_LINKS } from "@/config/company";

const SERVICE_LINKS = [
  { label: "出品業務", href: "/#service-listing" },
  { label: "併売", href: "/#service-channel" },
  { label: "問い合わせ対応", href: "/#service-support" },
  { label: "ページ改善", href: "/#service-page" },
];

const COMPANY_LINKS = [
  { label: "対応範囲", href: "/#scope" },
  { label: "進め方", href: "/#approach" },
  { label: "実績", href: "/#works" },
  { label: "会社概要", href: "/#company" },
  { label: "お問い合わせ", href: "/#contact" },
];

const EXTERNAL = [
  { label: "メディア", href: "/media", internal: true },
  { label: "CataMap", href: EXTERNAL_LINKS.catamap },
  { label: "note", href: EXTERNAL_LINKS.note },
];

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="t-kicker text-[11px] text-sc-fg/60">{title}</p>
      <ul className="mt-5 space-y-3 text-sm font-bold">{children}</ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer data-section-theme="dark" className="sc-dark relative overflow-hidden">
      <div className="sc-wrap pt-24 lg:pt-32">
        <div className="grid gap-16 border-b border-sc-fg/15 pb-20 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="t-h2 !text-[clamp(1.875rem,3.6vw,3.25rem)]">
              ECの課題を、
              <br />
              AIで<span className="text-sc-accent">解決する</span>。
            </p>
            <Link href="/#contact" className="sc-btn mt-10">
              <span className="sc-btn-label">相談する</span>
              <span className="sc-btn-icon">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </div>
          <nav aria-label="フッターメニュー" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6">
            <Column title="Services">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="sc-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </Column>
            <Column title="Company">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="sc-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </Column>
            <Column title="Links">
              {EXTERNAL.map((l) => (
                <li key={l.href}>
                  {l.internal ? (
                    <Link href={l.href} className="sc-link">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="sc-link inline-flex items-center gap-1">
                      {l.label}
                      <ArrowUpRight className="h-3.5 w-3.5 text-sc-fg/60" aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </Column>
          </nav>
        </div>

        <div className="flex flex-col gap-6 py-8 text-xs leading-relaxed text-sc-fg/60 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10" />
            <p>
              {COMPANY_INFO.name}
              <br />〒{COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.full}
            </p>
          </div>
          <p className="t-wide">© {new Date().getFullYear()} {COMPANY_INFO.nameEn}</p>
        </div>
      </div>
      <p
        aria-hidden
        className="t-wide pointer-events-none select-none whitespace-nowrap px-[1.5vw] text-center text-[10.4vw] font-bold leading-[0.78] tracking-[-0.04em] text-sc-fg/[0.07]"
      >
        Smile Comfort
      </p>
    </footer>
  );
}
