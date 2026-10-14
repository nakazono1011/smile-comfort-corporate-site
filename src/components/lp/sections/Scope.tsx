import type { CSSProperties } from "react";
import { CHANNELS, SCOPE, SERVICES } from "../content";
import { ScopeTabs } from "./ScopeTabs";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

function ChannelGlyph({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      {index === 0 && (
        <>
          <rect x="2.5" y="4" width="19" height="15" rx="1.5" />
          <path d="M2.5 8h19" />
        </>
      )}
      {index === 1 && (
        <>
          <path d="M3.5 9.5 5 4.5h14l1.5 5M5 12v7.5h14V12" strokeLinejoin="round" />
          <path d="M3.5 9.5h17" />
        </>
      )}
      {index === 2 && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 2.6 3 15.4 0 18M12 3c-3 2.6-3 15.4 0 18" />
        </>
      )}
    </svg>
  );
}

export function Scope() {
  return (
    <section
      id="scope"
      data-section-theme="dark"
      aria-labelledby="scope-title"
      className="relative py-28 sm:py-36 lg:py-44"
    >
      <div className="sc-wrap">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p data-reveal className="t-kicker text-sc-fg/60">
              Where we work
            </p>
            <h2 id="scope-title" data-reveal className="t-h2 mt-6" style={d(0.05)}>
              自社ECでも、モールでも。
              <br />
              国内でも、海外でも。
            </h2>
          </div>
          <p
            data-reveal
            className="self-end text-[15px] leading-[1.95] text-sc-fg/70 sm:text-base lg:col-span-4"
            style={d(0.1)}
          >
            売り場ごとに仕様もルールも違います。それぞれの事情を踏まえて、業務をまたいだひとつの仕組みとして設計します。ここに挙げていないECの課題も、まずはご相談ください。
          </p>
        </div>

        <div className="mt-12 lg:hidden">
          <ScopeTabs />
        </div>
        <div className="mt-24 hidden lg:block" role="table" aria-label="業務と売り場ごとの対応範囲">
          <div role="row" className="grid grid-cols-[13rem_repeat(3,1fr)] border-b border-sc-fg/20 pb-6">
            <div role="columnheader">
              <span className="sr-only">業務</span>
            </div>
            {CHANNELS.map((c, i) => (
              <div key={c.key} role="columnheader" data-reveal style={d(i * 0.06)} className="pr-6">
                <span className="text-sc-accent">
                  <ChannelGlyph index={i} />
                </span>
                <p className="mt-4 text-xl font-bold">{c.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-sc-fg/60">{c.examples.join(" / ")}</p>
              </div>
            ))}
          </div>

          {SERVICES.map((s) => (
            <div
              key={s.key}
              role="row"
              data-reveal
              className="group relative grid grid-cols-[13rem_repeat(3,1fr)] border-b border-sc-fg/15 py-9 transition-colors duration-500 hover:bg-sc-fg/[0.03]"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-sc-signal transition-transform duration-500 group-hover:scale-y-100" />
              <div role="rowheader" className="transition-transform duration-500 group-hover:translate-x-4">
                <span className="font-jp block text-[1.75rem] font-extrabold tracking-tight">{s.short}</span>
                <span className="t-kicker mt-3 block text-[10px] text-sc-fg/60">{s.en}</span>
              </div>
              {SCOPE[s.key].map((cell) => (
                <div
                  key={cell}
                  role="cell"
                  className="pr-6"
                >
                  <span className="flex gap-3 text-[15px] font-bold leading-relaxed text-sc-fg/80 transition-colors duration-300 group-hover:text-sc-fg">
                    <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 bg-sc-signal/70 transition-colors group-hover:bg-sc-signal" />
                    {cell}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
