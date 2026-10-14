"use client";

import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { AiMark, FlipNumber, useStepLoop, VisualFrame } from "./shared";

type Kind = "own" | "mall" | "global";

const NODES: { name: string; region: string; kind: Kind; x: number; y: number }[] = [
  { name: "自社EC", region: "JP", kind: "own", x: 15.5, y: 45 },
  { name: "楽天市場", region: "JP", kind: "mall", x: 28, y: 13 },
  { name: "Yahoo!ショッピング", region: "JP", kind: "mall", x: 72, y: 13 },
  { name: "Amazon.co.jp", region: "JP", kind: "mall", x: 84.5, y: 45 },
  { name: "Amazon.com", region: "US", kind: "global", x: 82, y: 82 },
  { name: "Shopee", region: "SG", kind: "global", x: 18, y: 82 },
];

const CENTER = { x: 50, y: 45 };
/** 注文が入る売り場の順番 */
const SELLERS = [1, 4, 0, 5, 3, 2];
const DURATIONS = [1100, 900, 700, 600, 800, 1700];
const START_STOCK = 24;

function StoreIcon({ kind }: { kind: Kind }) {
  if (kind === "own") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
        <rect x="2.5" y="4" width="19" height="15" rx="1.5" />
        <path d="M2.5 8h19M5.5 6h.01M7.5 6h.01" strokeLinecap="round" />
        <path d="M8 11.5h1.4l1.3 4.5h4.6l1.2-3.2H10" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
      <path d="M3.5 9.5 5 4.5h14l1.5 5" />
      <path d="M3.5 9.5c0 1.4 1.1 2.4 2.4 2.4s2.4-1 2.4-2.4c0 1.4 1.1 2.4 2.4 2.4s2.4-1 2.4-2.4c0 1.4 1.1 2.4 2.4 2.4s2.4-1 2.4-2.4" />
      <path d="M5 12v7.5h14V12M10 19.5v-4.5h4v4.5" />
      {kind === "global" && (
        <g strokeWidth={1.4}>
          <circle cx="19" cy="5" r="4" className="fill-sc-surface" />
          <path d="M15 5h8M19 1c1.5 1.4 1.5 6.6 0 8M19 1c-1.5 1.4-1.5 6.6 0 8" />
        </g>
      )}
    </svg>
  );
}

type Node = (typeof NODES)[number];

/** この売り場で注文が入っている最中か (注文バッジと強調枠を出す) */
const isSelling = (i: number, seller: number, step: number) => i === seller && step >= 1 && step <= 4;

/** 在庫数が更新済みか (売れた売り場は先に、ほかの売り場は連携の後に) */
const isUpdated = (i: number, seller: number, step: number) => (i === seller && step >= 3) || step >= 5;

/** 5 周ごとに入荷して在庫が戻る (その周の最初だけ「入荷」を出す) */
const isRestocked = (cycle: number, step: number) => cycle > 0 && cycle % 5 === 0 && step <= 1;

const stockBefore = (cycle: number) => START_STOCK - (cycle % 5);

function logEntry(c: number) {
  const seller = NODES[SELLERS[c % SELLERS.length]].name;
  const minute = String(40 + (c % 20)).padStart(2, "0");
  return {
    key: c,
    text: `${seller}で1点販売`,
    sub: `全6か所の在庫を${stockBefore(c) - 1}に更新`,
    time: `10:${minute}`,
  };
}

/** 直近 2 件の連携ログ (この周の連携が終わるまでは前の周まで) */
const logEntries = (cycle: number, step: number) =>
  [0, 1]
    .map((k) => cycle - k - (step >= 5 ? 0 : 1))
    .filter((c) => c >= 0)
    .map(logEntry);

const pulsePath = (from: { x: number; y: number }, to: { x: number; y: number }, key: string) => (
  <path
    key={key}
    d={`M${from.x} ${from.y} L${to.x} ${to.y}`}
    pathLength={100}
    className="vis-pulse stroke-sc-signal"
    strokeWidth={0.45}
    strokeLinecap="round"
  />
);

/** 注文の流れ: 売れた売り場 → 中央 (step 2)、中央 → ほかの売り場 (step 4) */
function Pulses({ step, cycle, seller }: { step: number; cycle: number; seller: number }) {
  if (step === 2) return pulsePath(NODES[seller], CENTER, `in-${cycle}`);
  if (step !== 4) return null;
  return NODES.filter((_, i) => i !== seller).map((n) => pulsePath(CENTER, n, `out-${cycle}-${n.name}`));
}

function CenterProduct({ stock, glowing, restocked }: { stock: number; glowing: boolean; restocked: boolean }) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
    >
      <div
        className={cn(
          "relative h-[7.2em] w-[7.2em] overflow-hidden rounded-full bg-[#E4EAE7] ring-1 ring-sc-fg/10 transition-shadow duration-500",
          glowing && "shadow-[0_0_0_0.5em_rgb(var(--c-signal)/0.25)]"
        )}
      >
        <Image src="/lp/products/bottle.webp" alt="" fill sizes="160px" className="scale-[1.35] object-cover" />
      </div>
      <div className="mt-[0.6em] flex items-baseline gap-[0.4em] rounded-[0.35em] bg-sc-fg px-[0.7em] py-[0.35em] text-sc-bg">
        <span className="text-[0.65em] font-bold">在庫</span>
        <FlipNumber value={stock} className="t-wide text-[1.15em] font-semibold leading-none" />
      </div>
      <span className="mt-[0.45em] text-[0.62em] font-bold text-sc-fg/55">保温ボトル500ml</span>
      {restocked && (
        <span className="vis-pop absolute -right-[3.5em] top-[0.4em] rounded-[0.3em] bg-sc-fg/80 px-[0.5em] py-[0.2em] text-[0.6em] font-bold text-sc-bg">
          入荷 +4
        </span>
      )}
    </div>
  );
}

function OrderBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="vis-pop absolute -top-[1.1em] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[0.3em] bg-sc-signal px-[0.5em] py-[0.18em] text-[0.58em] font-bold text-[#081410]">
      注文1件
    </span>
  );
}

function StoreNode({ node, stock, selling, updated }: { node: Node; stock: number; selling: boolean; updated: boolean }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
      <div
        className={cn(
          "relative flex w-[8em] items-center gap-[0.55em] [@container(min-width:540px)]:w-[10.2em] rounded-[0.45em] bg-sc-bg px-[0.6em] py-[0.5em] shadow-[0_0_0_1px_rgb(var(--c-fg)/0.1)] transition-[box-shadow,transform] duration-500",
          selling && "shadow-[0_0_0_2px_rgb(var(--c-signal))] [transform:translateY(-0.15em)]"
        )}
      >
        <span
          className={cn(
            "hidden h-[1.7em] w-[1.7em] shrink-0 [@container(min-width:540px)]:block",
            node.kind === "global" ? "text-sc-accent" : "text-sc-fg/70"
          )}
        >
          <StoreIcon kind={node.kind} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.62em] font-bold leading-tight">{node.name}</span>
          <span className="mt-[0.2em] flex items-center gap-[0.4em] text-[0.58em] text-sc-fg/55">
            <span className="t-wide font-semibold">{node.region}</span>
            <span>在庫</span>
            <FlipNumber
              value={stock}
              className={cn("t-wide font-semibold text-sc-fg transition-colors", updated && "text-sc-accent")}
            />
          </span>
        </span>
        <OrderBadge visible={selling} />
      </div>
    </div>
  );
}

/** 連携ログ (幅が広いときだけ) */
function SyncLog({ entries }: { entries: ReturnType<typeof logEntry>[] }) {
  return (
    <div className="absolute bottom-[1em] left-1/2 hidden w-[14.5em] -translate-x-1/2 [@container(min-width:540px)]:block">
      <div className="flex items-center justify-between">
        <span className="text-[0.6em] font-bold text-sc-fg/55">在庫連携ログ</span>
        <AiMark />
      </div>
      <ul className="mt-[0.4em] space-y-[0.3em]">
        {entries.map((l) => (
          <li
            key={l.key}
            className="vis-pop flex gap-[0.6em] rounded-[0.35em] bg-sc-bg/80 px-[0.6em] py-[0.4em] text-[0.58em] leading-snug shadow-[0_0_0_1px_rgb(var(--c-fg)/0.08)]"
          >
            <span className="t-wide font-semibold text-sc-fg/55">{l.time}</span>
            <span>
              <span className="font-bold">{l.text}</span>
              <span className="block text-sc-fg/55">{l.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChannelVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { step, cycle } = useStepLoop(ref, DURATIONS);
  const seller = SELLERS[cycle % SELLERS.length];
  const base = stockBefore(cycle);
  const stockOf = (i: number) => base - Number(isUpdated(i, seller, step));

  return (
    <VisualFrame
      label="Example"
      caption="どこかの売り場で1点売れると、自社EC・国内モール・海外モールの在庫数がそろって更新されます。売り越しや、在庫切れの表示し忘れを防ぎます。"
      className="aspect-square [@container(min-width:540px)]:aspect-[16/12]"
      narrowScale={31}
    >
      <div ref={ref} className="vis-grid absolute inset-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {NODES.map((n) => (
            <line
              key={n.name}
              x1={n.x}
              y1={n.y}
              x2={CENTER.x}
              y2={CENTER.y}
              className="stroke-sc-fg/20"
              strokeWidth={0.18}
              strokeDasharray="0.5 0.9"
            />
          ))}
          <Pulses step={step} cycle={cycle} seller={seller} />
        </svg>

        <CenterProduct
          stock={base - Number(step >= 3)}
          glowing={step === 3}
          restocked={isRestocked(cycle, step)}
        />

        {NODES.map((n, i) => (
          <StoreNode
            key={n.name}
            node={n}
            stock={stockOf(i)}
            selling={isSelling(i, seller, step)}
            updated={isUpdated(i, seller, step)}
          />
        ))}

        <SyncLog entries={logEntries(cycle, step)} />
      </div>
    </VisualFrame>
  );
}
