import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { EXTERNAL_LINKS } from "@/config/company";
import { WORKS } from "../content";
import { CatamapVisual } from "../visuals/CatamapVisual";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

export function Works() {
  return (
    <section
      id="works"
      data-section-theme="dark"
      aria-labelledby="works-title"
      className="relative py-28 sm:py-36 lg:py-44"
    >
      <div className="sc-wrap">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
            <p data-reveal className="t-kicker text-sc-fg/60">
              Works
            </p>
            <h2 id="works-title" data-reveal className="t-h2 mt-6" style={d(0.05)}>
              これまでに
              <br />
              つくったもの。
            </h2>
            <p data-reveal className="mt-8 max-w-[24em] text-[15px] leading-[1.95] text-sc-fg/70" style={d(0.1)}>
              ECの現場で実際に使われてきた仕組みです。案件ごとの詳しい内容は、ご相談の際にお話しします。
            </p>
            </div>
          </div>
          <ul className="border-t border-sc-fg/20 lg:col-span-7">
            {WORKS.map((w, i) => (
              <li key={w.title} data-reveal style={d(i * 0.05)} className="border-b border-sc-fg/20">
                <a
                  href={w.href}
                  className="group grid gap-2 py-7 transition-colors duration-500 hover:bg-sc-fg/[0.03] sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-3"
                >
                  <span className="text-xs font-bold text-sc-accent">{w.area}</span>
                  <span className="text-lg font-bold leading-snug">{w.title}</span>
                  <span className="hidden items-center gap-2 text-xs font-bold text-sc-fg/60 transition-colors group-hover:text-sc-fg sm:flex">
                    {w.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <article
          data-reveal
          aria-labelledby="catamap-title"
          className="mt-24 grid overflow-hidden rounded-[4px] bg-sc-surface ring-1 ring-sc-fg/10 lg:mt-32 lg:grid-cols-12"
        >
          <div className="relative min-h-[18rem] overflow-hidden bg-sc-fg/[0.04] lg:col-span-7">
            <CatamapVisual />
            <span className="absolute bottom-3 right-4 text-[11px] font-bold text-sc-fg/60">機能のイメージ図</span>
          </div>
          <div className="flex flex-col p-8 sm:p-10 lg:col-span-5 lg:p-12">
            <p className="t-kicker text-sc-fg/60">Our product</p>
            <h3 id="catamap-title" className="t-h3 mt-6 !text-[clamp(2rem,3.4vw,3rem)]">
              CataMap
            </h3>
            <p className="t-lead mt-4">AIが考える、売れるタグ。</p>
            <p className="mt-5 text-[15px] leading-[2] text-sc-fg/70">
              楽天市場やYahoo!ショッピングなどの商品カテゴリ・属性タグを、AIで自動補完するSaaSです。EC支援の現場で必要になった仕組みを、自社のプロダクトとして提供しています。
            </p>
            <div className="mt-10 lg:mt-auto lg:pt-10">
              <a
                href={EXTERNAL_LINKS.catamap}
                target="_blank"
                rel="noopener noreferrer"
                className="sc-btn sc-btn-ghost"
              >
                <span className="sc-btn-label">CataMapを見る</span>
                <span className="sc-btn-icon">
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
