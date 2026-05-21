import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AFFILIATE } from "@/config/affiliate";
import { OWN_PRODUCTS, type OwnProductKey } from "@/config/company";
import type { AffiliateProduct } from "@/lib/mdx";

type AffiliateIntent = "primary" | "support";
type AffiliateInlineCTAProps = {
  product: AffiliateProduct;
  locale?: "ja" | "en";
  variant?: "inline" | "large";
  intent?: AffiliateIntent;
  customHeadline?: string;
  customBody?: string;
};

type SelfProductInlineCTAProps = {
  locale?: "ja" | "en";
  intent: "self-product";
  ownProduct: OwnProductKey;
  customHeadline?: string;
  customBody?: string;
};

type InlineCTAProps = AffiliateInlineCTAProps | SelfProductInlineCTAProps;

export function InlineCTA(props: InlineCTAProps) {
  if (props.intent === "self-product") {
    return <SelfProductCTA {...props} />;
  }
  return <AffiliateInlineCTA {...props} />;
}

function AffiliateInlineCTA({
  product,
  locale = "ja",
  variant = "inline",
  intent = "primary",
  customHeadline,
  customBody,
}: AffiliateInlineCTAProps) {
  const cfg = AFFILIATE[product];
  const isSupport = intent === "support" && cfg.supportPitch;
  const href = isSupport ? (cfg.supportUrl ?? cfg.url) : cfg.url;
  const ctaLabel = isSupport
    ? (cfg.supportCta?.[locale] ?? cfg.primaryCta[locale])
    : cfg.primaryCta[locale];
  const headline =
    customHeadline ??
    (isSupport
      ? locale === "ja"
        ? `${cfg.brand[locale]}の導入や運用設計、お任せください`
        : `Need help deploying ${cfg.brand[locale]}? We can help.`
      : locale === "ja"
        ? `${cfg.brand[locale]}を試してみる`
        : `Try ${cfg.brand[locale]}`);
  const body =
    customBody ??
    (isSupport
      ? (cfg.supportPitch?.[locale] ?? cfg.description[locale])
      : cfg.description[locale]);

  const isLarge = variant === "large";

  return (
    <aside
      className={[
        "not-prose my-10",
        "rounded-2xl border border-brand-green/20",
        "bg-gradient-to-br from-brand-green/8 via-white to-support-blue-light/30",
        isLarge ? "p-8 md:p-10" : "p-6 md:p-7",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
            {isSupport
              ? locale === "ja"
                ? "Smile Comfort の支援"
                : "Smile Comfort Service"
              : locale === "ja"
                ? "PR"
                : "Sponsored"}
          </span>
          <span className="text-sm text-slate-500">{cfg.brand[locale]}</span>
        </div>
        <h3
          data-toc-exclude
          className={[
            "font-bold text-brand-deep leading-tight",
            isLarge ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
          ].join(" ")}
        >
          {headline}
        </h3>
        <p className="text-[15px] md:text-base text-slate-600 leading-relaxed">
          {body}
        </p>
        <div>
          <Link
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={
              href.startsWith("http") && !isSupport
                ? "noopener noreferrer sponsored"
                : href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
            }
            className={[
              "inline-flex items-center gap-2",
              "rounded-full bg-brand-green text-white",
              "font-semibold no-underline",
              "transition-colors hover:bg-brand-deep",
              isLarge ? "px-8 py-4 text-base" : "px-7 py-3.5 text-[15px]",
            ].join(" ")}
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

function SelfProductCTA({
  ownProduct,
  locale = "ja",
  customHeadline,
  customBody,
}: SelfProductInlineCTAProps) {
  const p = OWN_PRODUCTS[ownProduct];
  if (!p) return null;
  const headline = customHeadline ?? `${p.name} — ${p.tagline[locale]}`;
  const body = customBody ?? p.blurb[locale];
  const ctaLabel = locale === "ja" ? `${p.name} を見る` : `Visit ${p.name}`;

  return (
    <aside className="not-prose my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
          <span className="inline-flex items-center rounded-full bg-brand-deep/8 px-2.5 py-0.5 font-semibold text-brand-deep">
            {locale === "ja" ? "弊社運用プロダクト" : "Our product"}
          </span>
        </div>
        <h4 className="text-base md:text-lg font-semibold text-brand-deep">
          {headline}
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
        <div>
          <Link
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-green hover:text-brand-deep no-underline"
          >
            {ctaLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
