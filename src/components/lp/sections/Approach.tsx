import type { CSSProperties } from "react";
import { PRINCIPLES, STEPS } from "../content";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

/** 進め方の各段階を、針が1/4ずつ進む時計で表す */
function QuarterClock({ quarter }: { quarter: number }) {
  const angle = quarter * 90;
  const rad = (angle * Math.PI) / 180;
  const end = { x: 20 * Math.sin(rad), y: -20 * Math.cos(rad) };
  const arc =
    quarter === 4
      ? "M0 -20 A20 20 0 1 1 -0.01 -20 Z"
      : `M0 0 L0 -20 A20 20 0 ${angle > 180 ? 1 : 0} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
  return (
    <svg viewBox="-26 -26 52 52" className="h-16 w-16" aria-hidden>
      <circle r={20} fill="none" className="stroke-sc-fg/25" strokeWidth={1.5} />
      <path d={arc} className="fill-sc-signal/50" />
      <line
        x2={0}
        y2={-17}
        className="stroke-sc-fg"
        strokeWidth={2.5}
        strokeLinecap="round"
        transform={`rotate(${angle})`}
      />
      <circle r={3} className="fill-sc-fg" />
    </svg>
  );
}

export function Approach() {
  return (
    <section
      id="approach"
      data-section-theme="light"
      aria-labelledby="approach-title"
      className="relative py-28 sm:py-36 lg:py-44"
    >
      <div className="sc-wrap">
        <p data-reveal className="t-kicker text-sc-fg/60">
          How we work
        </p>
        <h2 id="approach-title" data-reveal className="t-h2 mt-6 max-w-[14em]" style={d(0.05)}>
          現場の業務に合わせて、
          <br />
          仕組みをつくる。
        </h2>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-[3px] bg-sc-fg/10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} data-reveal style={d(i * 0.08)} className="flex flex-col bg-sc-bg p-7 sm:p-8 lg:p-9">
              <QuarterClock quarter={i + 1} />
              <h3 className="t-lead mt-6 lg:mt-8">{s.title}</h3>
              <p className="mt-4 text-[15px] leading-[2] text-sc-fg/70">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-24 grid gap-12 lg:mt-32 lg:grid-cols-12">
          <h3 data-reveal className="t-lead lg:col-span-4">
            大切にしていること
          </h3>
          <ul className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} data-reveal style={d(i * 0.08)} className="border-t-2 border-sc-fg pt-5">
                <p className="text-lg font-bold">{p.title}</p>
                <p className="mt-3 text-[15px] leading-[2] text-sc-fg/70">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
