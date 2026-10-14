import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { CHANNELS } from "../content";
import { DialFace } from "../dial/DialFace";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function Hero() {
  return (
    <section
      data-section-theme="light"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-x-clip pb-10 pt-[120px] lg:pb-12 lg:pt-[132px]"
    >
      <div className="sc-wrap flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center lg:w-[54%] lg:pr-6">
          <p className="hero-fade t-kicker flex items-center gap-3 text-sc-fg/60" style={i(0)}>
            <span aria-hidden className="h-px w-8 bg-sc-fg/40" />
            EC × AI
          </p>
          <h1 id="hero-title" className="t-hero mt-7">
            <span className="hero-line">
              <span style={i(0)}>ECの課題を、</span>
            </span>
            <span className="hero-line">
              <span style={i(1)}>
                AIで<span className="text-sc-accent">解決する</span>。
              </span>
            </span>
          </h1>
          <p
            className="hero-fade mt-8 max-w-[34em] text-[15px] leading-[1.95] text-sc-fg/70 sm:text-base"
            style={i(1)}
          >
            自社EC、国内モール、海外モール。売り場がどこであっても、ECの現場で毎日くり返す作業をAIと仕組みで軽くします。業務の棚卸しから開発・運用まで、一緒に進めます。
          </p>
          <div className="hero-fade mt-10 flex flex-wrap gap-3" style={i(2)}>
            <a href="#contact" className="sc-btn">
              <span className="sc-btn-label">相談する</span>
              <span className="sc-btn-icon">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </a>
            <a href="#services" className="sc-btn sc-btn-ghost">
              <span className="sc-btn-label">できることを見る</span>
            </a>
          </div>
        </div>

        <div aria-hidden className="relative mt-14 flex justify-center lg:hidden">
          <DialFace className="w-[min(100vw,560px)] max-w-none" />
        </div>

        <dl
          className="hero-fade mt-12 grid grid-cols-3 gap-4 border-t border-sc-fg/15 pt-5 lg:mt-10 lg:w-[54%]"
          style={i(3)}
        >
          {CHANNELS.map((c) => (
            <div key={c.key}>
              <dt className="t-kicker text-[10px] text-sc-fg/60 sm:text-xs">{c.en}</dt>
              <dd className="mt-2 text-sm font-bold sm:text-base">{c.title}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
