"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { CHANNELS, SCOPE, SERVICES } from "../content";

/** スマホ用の対応範囲: 売り場をタブで切り替え、4 業務ぶんの行だけを見せる (表のままだと縦に長くなりすぎる) */
export function ScopeTabs() {
  const [current, setCurrent] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (current + (e.key === "ArrowRight" ? 1 : CHANNELS.length - 1)) % CHANNELS.length;
    setCurrent(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="lg:hidden">
      <div role="tablist" aria-label="売り場" className="grid grid-cols-3 border-b border-sc-fg/20">
        {CHANNELS.map((c, i) => (
          <button
            key={c.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            id={`scope-tab-${c.key}`}
            role="tab"
            type="button"
            aria-selected={current === i}
            aria-controls={`scope-panel-${c.key}`}
            tabIndex={current === i ? 0 : -1}
            onClick={() => setCurrent(i)}
            onKeyDown={onKeyDown}
            className={cn(
              "relative py-4 text-left text-[15px] font-bold transition-colors",
              current === i ? "text-sc-fg" : "text-sc-fg/60"
            )}
          >
            {c.title}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 -bottom-px h-[2px] origin-left bg-sc-signal transition-transform duration-500",
                current === i ? "scale-x-100" : "scale-x-0"
              )}
            />
          </button>
        ))}
      </div>
      {CHANNELS.map((c, i) => (
        <div
          key={c.key}
          id={`scope-panel-${c.key}`}
          role="tabpanel"
          aria-labelledby={`scope-tab-${c.key}`}
          hidden={current !== i}
        >
          <p className="pt-4 text-xs leading-relaxed text-sc-fg/60">{c.examples.join(" / ")}</p>
          <ul className="mt-2">
            {SERVICES.map((s) => (
              <li key={s.key} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-sc-fg/15 py-4">
                <span className="font-jp text-lg font-extrabold tracking-tight">{s.short}</span>
                <span className="text-[15px] font-bold leading-relaxed text-sc-fg/85">{SCOPE[s.key][i]}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
