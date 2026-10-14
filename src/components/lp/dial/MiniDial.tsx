"use client";

import { useRef } from "react";
import { SERVICES } from "../content";
import { useDialFace } from "./dialContext";
import { clamp } from "./dialMotion";

/** 針・円弧・下端のバーを、一周に対する進み具合 (swept°) に合わせる */
function drawProgress(
  parts: { hand: SVGLineElement | null; arc: SVGCircleElement | null; bar: HTMLSpanElement | null },
  angle: number,
  swept: number
) {
  parts.hand?.setAttribute("transform", `rotate(${angle})`);
  parts.arc?.setAttribute("stroke-dashoffset", `${100 - (swept / 360) * 100}`);
  parts.bar?.style.setProperty("transform", `scaleX(${swept / 360})`);
}

/** 今の業務名と時刻の範囲を書き換える */
function writeChapter(label: HTMLElement | null, span: HTMLElement | null, active: number) {
  const s = SERVICES[active];
  if (!s) return;
  if (label) label.textContent = s.title;
  if (span) span.textContent = s.span;
}

/**
 * スマホ用: サービス章の上端に貼り付く細い進捗バー。
 * 小さな文字盤・今の業務名・時刻の範囲・一周に対する進み具合を並べる (事例の上に重ならないよう全幅の帯にする)
 */
export function MiniDial() {
  const handRef = useRef<SVGLineElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(-1);

  useDialFace(({ angle, mode, active }) => {
    const parts = { hand: handRef.current, arc: arcRef.current, bar: barRef.current };
    drawProgress(parts, angle, mode === "idle" ? 0 : clamp(angle, 0, 360));
    if (activeRef.current === active) return;
    activeRef.current = active;
    writeChapter(labelRef.current, spanRef.current, active);
  });

  return (
    <div aria-hidden className="sc-bleed sticky top-0 z-30 lg:hidden">
      <div className="relative flex h-12 items-center gap-3 border-b border-sc-fg/10 bg-sc-bg/90 backdrop-blur-md">
        <svg viewBox="-50 -50 100 100" className="h-7 w-7 shrink-0">
          <circle r={44} fill="none" className="stroke-sc-fg/15" strokeWidth={7} />
          <circle
            ref={arcRef}
            r={44}
            fill="none"
            className="stroke-sc-signal"
            strokeWidth={7}
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={100}
            transform="rotate(-90)"
          />
          <line ref={handRef} y1={6} y2={-30} className="stroke-sc-fg" strokeWidth={7} strokeLinecap="round" />
          <circle r={8} className="fill-sc-fg" />
        </svg>
        <span ref={labelRef} className="text-sm font-bold">
          {SERVICES[0].title}
        </span>
        <span ref={spanRef} className="t-wide ml-auto text-[11px] font-semibold tabular-nums text-sc-fg/60">
          {SERVICES[0].span}
        </span>
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-sc-fg/10">
          <span ref={barRef} className="block h-full origin-left scale-x-0 bg-sc-signal" />
        </span>
      </div>
    </div>
  );
}
