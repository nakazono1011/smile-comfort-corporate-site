"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { ensureUniqueId } from "@/lib/slugify";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  locale?: "ja" | "en";
  variant?: "sidebar" | "inline";
}

export function TableOfContents({
  locale = "ja",
  variant = "sidebar",
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        "article h2:not([data-toc-exclude]), article h3:not([data-toc-exclude])",
      ),
    );
    const usedIds = new Set<string>();
    const data: Heading[] = els.map((el, idx) => {
      const text = el.textContent || "";
      const generated =
        text
          .toLowerCase()
          .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
          .replace(/\s+/g, "-")
          .slice(0, 60) || `heading-${idx}`;
      const baseId = el.id || generated;
      const id = ensureUniqueId(baseId, usedIds);
      if (el.id !== id) el.id = id;

      return {
        id,
        text,
        level: parseInt(el.tagName.charAt(1), 10),
      };
    });

    setHeadings(data);
    if (data.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;
  const title = locale === "ja" ? "目次" : "Table of Contents";

  if (variant === "inline") {
    return (
      <nav className="not-prose mb-10 lg:hidden">
        <details className="rounded-2xl border border-slate-200 bg-support-blue-light/40 px-5 py-4">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-brand-deep font-semibold">
            <List className="h-4 w-4 text-brand-green" />
            <span>{title}</span>
          </summary>
          <ol className="mt-4 space-y-2">
            {headings.map((h) => (
              <li
                key={h.id}
                style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
                className="text-[15px]"
              >
                <a
                  href={`#${h.id}`}
                  className={`block no-underline rounded px-2 py-1 transition-colors ${
                    activeId === h.id
                      ? "text-brand-green bg-white font-medium"
                      : "text-slate-600 hover:text-brand-deep"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </details>
      </nav>
    );
  }

  return (
    <nav className="not-prose sticky top-24 hidden lg:block">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-brand-deep font-semibold text-sm uppercase tracking-wide">
          <List className="h-4 w-4 text-brand-green" />
          <span>{title}</span>
        </div>
        <ol className="max-h-[calc(100vh-12rem)] overflow-y-auto space-y-1.5 text-sm">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
              <a
                href={`#${h.id}`}
                className={`block no-underline rounded px-2 py-1 leading-snug transition-colors ${
                  activeId === h.id
                    ? "text-brand-green bg-brand-green/5 font-medium border-l-2 border-brand-green -ml-[2px]"
                    : "text-slate-600 hover:text-brand-deep hover:bg-slate-50"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
