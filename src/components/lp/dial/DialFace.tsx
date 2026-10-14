"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { SERVICES } from "../content";
import { useDialFace, type DialState } from "./dialContext";
import { clamp, normalizeAngle } from "./dialMotion";

/** viewBoxは中心 (0,0)、一辺1100 */
const VIEW = 1100;
const RING = 360;
const INNER = 230;
const CHIP_R = 448;
const LABEL_R = 150;
/** idle時、針が通ってからチェックが外れるまでの角度 */
const DONE_SPAN = 230;
/** idle時に光る目盛りの幅 */
const TRAIL = 70;

/** サーバーとブラウザで三角関数の末尾の桁が揃わないことがあるため、座標は丸めて使う */
const round = (n: number) => Math.round(n * 100) / 100;

const polar = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: round(r * Math.sin(rad)), y: round(-r * Math.cos(rad)) };
};

const toPct = (r: number, deg: number) => {
  const p = polar((r / VIEW) * 100, deg);
  return { left: `${round(50 + p.x)}%`, top: `${round(50 + p.y)}%` };
};

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0;
  const deg = i * 6;
  const from = polar(major ? RING - 40 : RING - 20, deg);
  const to = polar(RING, deg);
  return { deg, major, x1: from.x, y1: from.y, x2: to.x, y2: to.y };
});

const CHIPS = SERVICES.flatMap((s, q) =>
  s.tasks.map((label, k) => ({ label, deg: q * 90 + 18 + k * 27 }))
);

const LABELS = SERVICES.map((s, q) => ({ label: s.short, deg: q * 90 + 45 }));

type Prev = { mode: string; dim: boolean; active: number; lit: string; done: string; near: number };
type Marks = (HTMLElement | SVGElement | null)[];

/** 前回と値が変わったときだけ DOM に書く (毎フレームの書き込みを減らす) */
function onChange<K extends keyof Prev>(prev: Prev, key: K, value: Prev[K], write: () => void) {
  if (prev[key] === value) return;
  prev[key] = value;
  write();
}

const toggleAll = (els: Marks, attr: string, on: (i: number) => boolean) =>
  els.forEach((el, i) => el?.toggleAttribute(attr, on(i)));

const flags = (items: { deg: number }[], test: (deg: number) => boolean) =>
  items.map((t) => (test(t.deg) ? "1" : "0")).join("");

const angularDistance = (a: number, b: number) => {
  const d = Math.abs(normalizeAngle(a - b));
  return Math.min(d, 360 - d);
};

/** 長針が業務名の ±16° に入っていれば、その業務名の番号 (なければ -1) */
const nearLabel = (norm: number) => LABELS.findIndex((l) => angularDistance(norm, l.deg) < 16);

/** 光らせる範囲の終わりの角度 */
function sweptAngle(mode: DialState["mode"], angle: number, norm: number) {
  if (mode === "rewind") return 360;
  return mode === "scroll" ? clamp(angle, 0, 360) : norm;
}

/** 「針が通過済み」か: rewind はすべて、scroll は今の角度まで、idle は針の後ろ span° まで */
function passed(mode: DialState["mode"], deg: number, swept: number, norm: number, span: number) {
  if (mode === "rewind") return true;
  return mode === "scroll" ? deg <= swept : normalizeAngle(norm - deg) < span;
}

function applyHands(
  parts: { minute: SVGGElement | null; hour: SVGGElement | null; sweep: HTMLDivElement | null },
  state: DialState,
  swept: number
) {
  parts.minute?.setAttribute("transform", `rotate(${state.angle})`);
  parts.hour?.setAttribute("transform", `rotate(${state.hour})`);
  parts.sweep?.style.setProperty("--a", `${swept}deg`);
}

/** 山場の後半で中央の一言を浮かび上がらせ、針と業務名を退かせる (CSS は --rewind を見る) */
function applyMessage(root: HTMLElement, el: HTMLElement | null, rewind: number) {
  if (!el) return;
  const m = clamp((rewind - 0.55) / 0.3, 0, 1);
  el.style.opacity = String(m);
  el.style.transform = `translate(-50%, calc(-50% + ${(1 - m) * 12}px))`;
  root.style.setProperty("--rewind", String(m));
}

function applyRoot(root: HTMLElement, p: Prev, state: DialState) {
  onChange(p, "mode", state.mode, () => {
    root.dataset.mode = state.mode;
  });
  onChange(p, "dim", state.dim, () => {
    root.style.opacity = state.dim ? "0.12" : "1";
  });
}

function applyLabels(els: Marks, p: Prev, active: number, near: number) {
  onChange(p, "active", active, () => toggleAll(els, "data-active", (i) => i === active));
  onChange(p, "near", near, () => toggleAll(els, "data-near", (i) => i === near));
}

function applyMarks(ticks: Marks, chips: Marks, p: Prev, test: (deg: number, span: number) => boolean) {
  const lit = flags(TICKS, (deg) => test(deg, TRAIL));
  onChange(p, "lit", lit, () => toggleAll(ticks, "data-lit", (i) => lit[i] === "1"));
  const done = flags(CHIPS, (deg) => test(deg, DONE_SPAN));
  onChange(p, "done", done, () => toggleAll(chips, "data-done", (i) => done[i] === "1"));
}

export function DialFace({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<SVGGElement>(null);
  const hourRef = useRef<SVGGElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prev = useRef<Prev>({ mode: "", dim: false, active: -1, lit: "", done: "", near: -1 });

  useDialFace((state) => {
    const root = rootRef.current;
    if (!root) return;
    const norm = normalizeAngle(state.angle);
    const swept = sweptAngle(state.mode, state.angle, norm);
    applyHands({ minute: minuteRef.current, hour: hourRef.current, sweep: sweepRef.current }, state, swept);
    applyMessage(root, messageRef.current, state.rewind);
    applyRoot(root, prev.current, state);
    applyLabels(labelRefs.current, prev.current, state.active, nearLabel(norm));
    applyMarks(tickRefs.current, chipRefs.current, prev.current, (deg, span) =>
      passed(state.mode, deg, swept, norm, span)
    );
  });

  const sweepInset = `${((VIEW / 2 - RING) / VIEW) * 100}%`;

  return (
    <div
      ref={rootRef}
      data-mode="idle"
      data-nosnippet
      className={cn(
        "dial dial-intro relative aspect-square transition-opacity duration-700",
        className
      )}
    >
      <div
        ref={sweepRef}
        className="dial-sweep absolute rounded-full"
        style={{ inset: sweepInset }}
      />
      <svg
        viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <circle r={RING} fill="none" className="stroke-sc-fg/15" strokeWidth={1.5} />
        <circle r={INNER} fill="none" className="stroke-sc-fg/10" strokeWidth={1.5} />
        <circle
          r={520}
          fill="none"
          className="stroke-sc-fg/15"
          strokeWidth={1.5}
          strokeDasharray="1.5 14"
          strokeLinecap="round"
        />
        {[0, 90, 180, 270].map((deg) => {
          const from = polar(INNER, deg);
          const to = polar(RING - 52, deg);
          return (
            <line
              key={deg}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="stroke-sc-fg/15"
              strokeWidth={1.5}
            />
          );
        })}
        {TICKS.map((t, i) => (
          <line
            key={t.deg}
            ref={(el) => {
              tickRefs.current[i] = el;
            }}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            className="dial-tick"
            strokeWidth={t.major ? 4 : 2}
            strokeLinecap="round"
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </svg>

      <p
        ref={messageRef}
        className="dial-message pointer-events-none absolute left-1/2 top-1/2 w-[34%] text-center opacity-0"
      >
        取り戻した時間で、
        <br />
        売り場を育てる。
      </p>

      {CHIPS.map((c, i) => (
        <span
          key={c.label}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          className="dial-chip"
          style={{ ...toPct(CHIP_R, c.deg), "--i": i + 4 } as React.CSSProperties}
        >
          <i />
          {c.label}
        </span>
      ))}

      <svg
        viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
        className="dial-hands pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <g ref={hourRef} transform="rotate(300)">
          <line y1={28} y2={-118} className="stroke-sc-fg" strokeWidth={13} strokeLinecap="round" />
        </g>
        <g ref={minuteRef} transform="rotate(-90)">
          <line y1={52} y2={-322} className="stroke-sc-fg" strokeWidth={5} strokeLinecap="round" />
          <circle cy={-322} r={10} className="fill-sc-signal" />
        </g>
        <circle r={20} className="fill-sc-fg" />
        <circle r={7} className="fill-sc-signal" />
      </svg>

      {LABELS.map((l, i) => (
        <span
          key={l.label}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="dial-label"
          style={{ ...toPct(LABEL_R, l.deg), "--i": i } as React.CSSProperties}
        >
          {l.label}
        </span>
      ))}
    </div>
  );
}
