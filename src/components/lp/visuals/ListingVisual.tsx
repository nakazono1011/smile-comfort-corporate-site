"use client";

import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { AiMark, CheckIcon, Panel, TypeText, useStepLoop, VisualFrame } from "./shared";

const OUTPUTS = [
  {
    mall: "楽天市場",
    region: "JP",
    category: "メンズファッション › トップス › シャツ",
    attrs: ["素材: 麻100%", "袖丈: 半袖", "色: グリーン系", "サイズ: M / L / XL"],
    title: "リネン 開襟シャツ 半袖 麻100%セージグリーン メンズ",
  },
  {
    mall: "Yahoo!ショッピング",
    region: "JP",
    category: "ファッション › メンズ › トップス › シャツ",
    attrs: ["素材: リネン", "袖: 半袖", "カラー: グリーン", "サイズ: M・L・XL"],
    title: "開襟シャツ メンズ リネン100%半袖 セージ 春夏",
  },
  {
    mall: "Amazon.com",
    region: "US",
    category: "Clothing › Men › Shirts › Casual Button-Down",
    attrs: ["Material: 100% Linen", "Sleeve: Short", "Color: Sage Green", "Size: M / L / XL"],
    title: "Men's 100% Linen Camp Collar Short Sleeve Shirt, Sage Green",
  },
] as const;

/** 1売り場あたり4段階 (カテゴリ → 属性 → 商品名 → 完了) × 3、最後にCSV出力 */
const DURATIONS = [...Array(3).fill([600, 900, 1700, 700]).flat(), 2400] as number[];
const FIELDS = ["カテゴリ", "属性", "商品名"] as const;

type Output = (typeof OUTPUTS)[number];
type FieldStatus = "empty" | "working" | "filled";

/** step から「出力済みか・どの売り場のタブか・そのタブで何欄目まで進んだか」を求める */
function progressAt(step: number) {
  if (step >= 12) return { exported: true, tab: 2, sub: 4 };
  return { exported: false, tab: Math.floor(step / 4), sub: step % 4 };
}

const tabState = (i: number, tab: number, exported: boolean) => {
  if (exported || i < tab) return "done";
  return i === tab ? "current" : "todo";
};

const fieldStatus = (i: number, sub: number): FieldStatus => {
  if (sub > i) return "filled";
  return sub === i ? "working" : "empty";
};

function ExportBadge({ exported }: { exported: boolean }) {
  if (!exported) {
    return (
      <span className="rounded-[0.25em] bg-sc-fg/10 px-[0.5em] py-[0.15em] text-[0.55em] font-bold text-sc-fg/55 transition-colors duration-500">
        CSV出力待ち
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[0.3em] rounded-[0.25em] bg-sc-signal px-[0.5em] py-[0.15em] text-[0.55em] font-bold text-[#081410] transition-colors duration-500">
      CSV 3件を出力済み
      <CheckIcon />
    </span>
  );
}

function OutputTab({ output, state }: { output: Output; state: ReturnType<typeof tabState> }) {
  const current = state === "current";
  return (
    <span
      className={cn(
        "relative flex items-center gap-[0.35em] px-[0.55em] pb-[0.5em] pt-[0.2em] text-[0.56em] font-bold transition-colors",
        current ? "text-sc-fg" : "text-sc-fg/55"
      )}
    >
      {output.mall}
      <span className="t-wide text-[0.85em] font-semibold text-sc-fg/55">{output.region}</span>
      {state === "done" && <CheckIcon className="text-sc-accent" />}
      {current && <span className="absolute inset-x-[0.4em] bottom-0 h-[2px] bg-sc-signal" />}
    </span>
  );
}

function Skeleton({ scanning }: { scanning: boolean }) {
  return <span className={cn("vis-skel mt-[0.25em]", scanning ? "vis-scan w-[85%]" : "w-[70%]")} />;
}

type FieldProps = { status: FieldStatus; output: Output };

function CategoryValue({ status, output }: FieldProps) {
  if (status !== "filled") return <Skeleton scanning={status === "working"} />;
  return <span className="vis-pop block text-[0.62em] font-bold leading-snug">{output.category}</span>;
}

function AttrsValue({ status, output }: FieldProps) {
  if (status !== "filled") return <Skeleton scanning={status === "working"} />;
  return (
    <span className="flex flex-wrap gap-[0.3em]">
      {output.attrs.map((a, k) => (
        <span
          key={a}
          className="vis-pop rounded-[0.25em] bg-sc-signal/15 px-[0.45em] py-[0.15em] text-[0.56em] font-bold text-sc-fg/80"
          style={{ animationDelay: `${k * 0.08}s` }}
        >
          {a}
        </span>
      ))}
    </span>
  );
}

/** 商品名は、作業中から 1 文字ずつ打ち込む */
function TitleValue({ status, output }: FieldProps) {
  if (status === "empty") return <Skeleton scanning={false} />;
  return (
    <span className="block text-[0.64em] font-bold leading-snug">
      <TypeText text={output.title} active speed={22} />
    </span>
  );
}

const FIELD_VIEWS = [CategoryValue, AttrsValue, TitleValue];

export function ListingVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useStepLoop(ref, DURATIONS);
  const { exported, tab, sub } = progressAt(step);
  const out = OUTPUTS[tab];

  return (
    <VisualFrame
      label="Example"
      caption="商品写真と簡単なメモから、売り場ごとのカテゴリ・属性・商品名を作成。海外モール向けには英語の商品名と属性も用意し、モール別のCSVにまとめて出力します。"
      className="p-[1.1em] [@container(min-width:540px)]:aspect-[16/10] [@container(min-width:540px)]:p-[1.4em]"
    >
      <div ref={ref} className="vis-grid absolute inset-0" aria-hidden />
      <div className="relative flex h-full flex-col items-stretch gap-[0.8em] [@container(min-width:540px)]:flex-row [@container(min-width:540px)]:items-center">
        {/* 元データ */}
        <Panel title="元データ" className="shrink-0 [@container(min-width:540px)]:w-[31%]">
          <div className="flex gap-[0.8em] p-[0.8em] [@container(min-width:540px)]:flex-col">
            <div className="relative aspect-square w-[38%] shrink-0 overflow-hidden rounded-[0.3em] bg-[#E4EAE7] [@container(min-width:540px)]:w-full">
              <Image src="/lp/products/shirt.webp" alt="" fill sizes="220px" className="object-cover" />
            </div>
            <dl className="min-w-0 space-y-[0.5em] text-[0.6em]">
              <div>
                <dt className="text-sc-fg/55">商品名</dt>
                <dd className="font-bold">リネン開襟シャツ</dd>
              </div>
              <div>
                <dt className="text-sc-fg/55">メモ</dt>
                <dd className="font-bold">麻100% / M・L・XL / セージ</dd>
              </div>
              <div>
                <dt className="text-sc-fg/55">価格</dt>
                <dd className="t-wide font-semibold">¥6,900</dd>
              </div>
            </dl>
          </div>
        </Panel>

        {/* 変換 */}
        <div className="flex shrink-0 items-center justify-center gap-[0.5em] [@container(min-width:540px)]:flex-col">
          <AiMark />
          <svg viewBox="0 0 40 12" className="w-[2.6em] rotate-90 text-sc-signal [@container(min-width:540px)]:rotate-0" aria-hidden>
            <path d="M0 6h36M31 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* 売り場ごとの出力 */}
        <Panel
          title="売り場ごとの出品データ"
          aside={<ExportBadge exported={exported} />}
          className="min-w-0 flex-1"
        >
          <div className="flex border-b border-sc-fg/10 px-[0.5em] pt-[0.4em]">
            {OUTPUTS.map((o, i) => (
              <OutputTab key={o.mall} output={o} state={tabState(i, tab, exported)} />
            ))}
          </div>
          <dl key={tab} className="space-y-[0.75em] p-[0.9em]">
            {FIELDS.map((f, i) => {
              const View = FIELD_VIEWS[i];
              return (
                <div key={f} className="grid grid-cols-[4.2em_1fr] items-start gap-[0.6em]">
                  <dt className="pt-[0.15em] text-[0.56em] font-bold text-sc-fg/55">{f}</dt>
                  <dd className="min-h-[1.4em] min-w-0">
                    <View status={fieldStatus(i, sub)} output={out} />
                  </dd>
                </div>
              );
            })}
          </dl>
        </Panel>
      </div>
    </VisualFrame>
  );
}
