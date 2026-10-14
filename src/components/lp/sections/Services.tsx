import type { ComponentType, CSSProperties } from "react";
import { SERVICES, type Service, type ServiceKey } from "../content";
import { MiniDial } from "../dial/MiniDial";
import { ChannelVisual } from "../visuals/ChannelVisual";
import { ListingVisual } from "../visuals/ListingVisual";
import { PageVisual } from "../visuals/PageVisual";
import { SupportVisual } from "../visuals/SupportVisual";

const VISUALS: Record<ServiceKey, ComponentType> = {
  listing: ListingVisual,
  channel: ChannelVisual,
  support: SupportVisual,
  page: PageVisual,
};

const d = (n: number) => ({ "--d": n }) as CSSProperties;

function Chapter({ service, index }: { service: Service; index: number }) {
  const Visual = VISUALS[service.key];
  return (
    <article
      id={`service-${service.key}`}
      data-chapter={index}
      aria-labelledby={`service-${service.key}-title`}
      className="relative scroll-mt-24 border-t border-sc-fg/10 py-16 sm:py-20 lg:min-h-[125svh] lg:border-t-0 lg:py-24"
    >
      <div className="lg:w-[52%]">
        <div data-reveal className="flex items-center gap-4 text-sc-fg/60">
          <span className="t-kicker">{service.en}</span>
          <span aria-hidden className="h-px flex-1 bg-sc-fg/15" />
          <span className="t-wide text-xs font-semibold tabular-nums">{service.span}</span>
        </div>
        <h3 id={`service-${service.key}-title`} data-reveal className="t-h3 mt-7" style={d(0.05)}>
          {service.title}
        </h3>
        <p data-reveal className="t-lead mt-6" style={d(0.1)}>
          {service.lead}
        </p>
        <p data-reveal className="mt-5 text-[15px] leading-[1.95] text-sc-fg/70 sm:text-base" style={d(0.15)}>
          {service.body}
        </p>

        <div data-reveal className="mt-10" style={d(0.1)}>
          <Visual />
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8">
          <div data-reveal>
            <p className="text-xs font-bold text-sc-fg/60">つくるもの・整えるもの</p>
            <ul className="mt-4 border-t border-sc-fg/10">
              {service.builds.map((b) => (
                <li key={b} className="flex items-start gap-3 border-b border-sc-fg/10 py-3 text-[15px] font-bold">
                  <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-sc-signal" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={d(0.08)}>
            <p className="text-xs font-bold text-sc-fg/60">これまでの実績</p>
            <ul className="mt-4 border-t border-sc-fg/10">
              {service.works.map((w) => (
                <li key={w} className="border-b border-sc-fg/10 py-3 text-[15px] leading-relaxed text-sc-fg/80">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Services() {
  return (
    <section
      id="services"
      data-section-theme="light"
      aria-labelledby="services-title"
      className="relative pt-28 sm:pt-36 lg:pt-44"
    >
      <div className="sc-wrap">
        <div className="lg:w-[52%]">
          <p data-reveal className="t-kicker text-sc-fg/60">
            What we do
          </p>
          <h2 id="services-title" data-reveal className="t-h2 mt-6" style={d(0.05)}>
            ECの現場で、
            <br />
            AIが引き受けること。
          </h2>
          <p data-reveal className="mt-8 max-w-[36em] text-[15px] leading-[1.95] text-sc-fg/70 sm:text-base" style={d(0.1)}>
            代表的な4つの業務を、文字盤の針が一周するあいだに紹介します。4つとも、自社EC・国内モール・海外モールのどの売り場の課題にも対応します。
          </p>
        </div>
        <div className="mt-16 lg:mt-8">
          <MiniDial />
          {SERVICES.map((s, i) => (
            <Chapter key={s.key} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
