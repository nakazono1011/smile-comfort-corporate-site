"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/mdx";

interface FAQAccordionProps {
  items?: FaqItem[];
  locale?: "ja" | "en";
  title?: string;
}

export function FAQAccordion({ items, locale = "ja", title }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!items || items.length === 0) return null;

  const headingText =
    title ?? (locale === "ja" ? "よくある質問" : "Frequently asked questions");

  return (
    <section className="not-prose my-12">
      <h2 className="text-[28px] font-bold text-brand-deep mb-6" id="faq">
        {headingText}
      </h2>
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="font-semibold text-brand-deep text-[17px] leading-snug">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-slate-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen ? (
                <div className="px-6 pb-6 text-[16px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {item.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
