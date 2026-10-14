import type { CSSProperties } from "react";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { FAQS } from "../content";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

export function Faq() {
  return (
    <section
      id="faq"
      data-section-theme="light"
      aria-labelledby="faq-title"
      className="relative py-28 sm:py-36 lg:py-44"
    >
      <FaqJsonLd faqs={FAQS.map((f) => ({ question: f.q, answer: f.a }))} />
      <div className="sc-wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal className="t-kicker text-sc-fg/60">
            FAQ
          </p>
          <h2 id="faq-title" data-reveal className="t-h2 mt-6" style={d(0.05)}>
            よくある
            <br />
            ご質問
          </h2>
        </div>
        <div className="border-t border-sc-fg/15 lg:col-span-7">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              data-reveal
              style={d(i * 0.05)}
              className="group border-b border-sc-fg/15"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-lg font-bold leading-relaxed marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="relative mt-[0.55em] h-3.5 w-3.5 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-sc-fg" />
                  <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-sc-fg transition-transform duration-500 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="pb-7 pr-10 text-[15px] leading-[1.95] text-sc-fg/70">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
