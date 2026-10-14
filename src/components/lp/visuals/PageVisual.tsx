"use client";

import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { AiMark, Panel, TypeText, useStepLoop, VisualFrame } from "./shared";

const DURATIONS = [900, 1600, 1400, 2300, 1400, 2600];

const REVIEWS = [
  { text: "思ったより小さい", tone: "neg" },
  { text: "A4が入るか不安", tone: "neg" },
  { text: "生地はしっかり", tone: "pos" },
] as const;

const SUGGESTIONS = [
  {
    level: "高",
    finding: "レビューで「思ったより小さい」が最も多い",
    action: "A4書類を入れた写真を2枚目に追加",
  },
  {
    level: "高",
    finding: "上位の競合はタイトルに容量と素材を書いている",
    action: "タイトルを書き換え",
  },
  {
    level: "中",
    finding: "スマホでは送料の案内が購入ボタンの下に隠れる",
    action: "送料の案内を価格の横へ移動",
  },
] as const;

const TITLE_BEFORE = "キャンバス トートバッグ";
const TITLE_AFTER = "A4が入る 厚手帆布トート｜緑の持ち手";

function Marker({ show, className }: { show: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-10 grid h-[1.3em] w-[1.3em] place-items-center rounded-full bg-sc-signal text-[0.62em] font-bold text-[#081410] transition-[opacity,transform] duration-500",
        show ? "scale-100 opacity-100" : "scale-50 opacity-0",
        className
      )}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-sc-signal/50" />
    </span>
  );
}

type Suggestion = (typeof SUGGESTIONS)[number];

/** レビューを読み取っている間、写真の上に代表的な声を出す */
function ProductPhoto({ showReviews }: { showReviews: boolean }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-[0.3em] bg-[#E4EAE7]">
      <Image src="/lp/products/tote.webp" alt="" fill sizes="240px" className="object-cover" />
      <div
        className={cn(
          "absolute inset-x-[0.5em] bottom-[0.5em] flex flex-col items-start gap-[0.3em] transition-opacity duration-500",
          showReviews ? "opacity-100" : "opacity-0"
        )}
      >
        {REVIEWS.map((r, i) => (
          <span
            key={r.text}
            className={cn(
              "inline-flex items-center gap-[0.4em] rounded-[0.3em] bg-sc-bg/95 px-[0.5em] py-[0.25em] text-[0.55em] font-bold shadow-[0_0.3em_0.8em_-0.3em_rgb(0_0_0/0.3)]",
              showReviews && "vis-pop"
            )}
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            <span className={cn("h-[0.55em] w-[0.55em] rounded-full", r.tone === "neg" ? "bg-[#E2725B]" : "bg-sc-signal")} />
            {r.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 2 枚目に「A4 を入れた写真」を足す提案 */
function Thumbs({ proposed }: { proposed: boolean }) {
  return (
    <div className="relative grid grid-cols-4 gap-[0.3em]">
      <Marker show={proposed} className="-left-[0.4em] -top-[0.4em]" />
      <span className="aspect-square rounded-[0.2em] bg-[#E4EAE7] ring-1 ring-sc-fg/20" />
      <span
        className={cn(
          "grid aspect-square place-items-center rounded-[0.2em] text-[0.5em] font-bold transition-colors duration-500",
          proposed ? "bg-sc-signal/20 text-sc-accent ring-1 ring-sc-signal" : "bg-sc-fg/5 text-transparent"
        )}
      >
        ＋A4
      </span>
      <span className="aspect-square rounded-[0.2em] bg-sc-fg/5" />
      <span className="aspect-square rounded-[0.2em] bg-sc-fg/5" />
    </div>
  );
}

function Title({ rewritten }: { rewritten: boolean }) {
  if (!rewritten) return <p className="text-[0.82em] font-bold leading-snug">{TITLE_BEFORE}</p>;
  return (
    <p className="text-[0.82em] font-bold leading-snug">
      <span className="mr-[0.3em] text-[0.8em] text-sc-fg/55 line-through">{TITLE_BEFORE}</span>
      <span className="bg-sc-signal/20">
        <TypeText text={TITLE_AFTER} active speed={45} />
      </span>
    </p>
  );
}

/** 送料の案内を、購入ボタンの下から価格の横へ移す提案 */
function Price({ moved }: { moved: boolean }) {
  return (
    <div className="relative mt-[0.7em] flex flex-wrap items-center gap-[0.5em]">
      <span className="t-wide text-[1.05em] font-semibold">¥3,980</span>
      <span
        className={cn(
          "rounded-[0.25em] bg-sc-signal/20 px-[0.45em] py-[0.15em] text-[0.52em] font-bold text-sc-accent transition-[opacity,transform] duration-500",
          moved ? "translate-x-0 opacity-100" : "-translate-x-[0.4em] opacity-0"
        )}
      >
        5,000円以上で送料無料
      </span>
      <Marker show={moved} className="-right-[0.2em] -top-[0.6em]" />
    </div>
  );
}

function ColorChips() {
  return (
    <div className="mt-[0.9em]">
      <span className="text-[0.5em] font-bold text-sc-fg/55">カラー</span>
      <div className="mt-[0.3em] flex gap-[0.3em]">
        {["ナチュラル", "ブラック"].map((c, k) => (
          <span
            key={c}
            className={cn(
              "rounded-[0.25em] px-[0.5em] py-[0.2em] text-[0.5em] font-bold",
              k === 0
                ? "bg-sc-fg/10 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.5)]"
                : "shadow-[0_0_0_1px_rgb(var(--c-fg)/0.15)] text-sc-fg/55"
            )}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Cart({ shippingMoved }: { shippingMoved: boolean }) {
  return (
    <>
      <span className="mt-auto block rounded-[0.3em] bg-sc-fg py-[0.6em] text-center text-[0.62em] font-bold text-sc-bg">
        カートに入れる
      </span>
      <span
        className={cn(
          "mt-[0.4em] text-center text-[0.5em] text-sc-fg/55 transition-opacity duration-500",
          shippingMoved && "opacity-0"
        )}
      >
        5,000円以上で送料無料
      </span>
    </>
  );
}

/** 優先度のバーの長さ (表示前は 0) */
function barWidth(shown: boolean, level: Suggestion["level"]) {
  if (!shown) return "0%";
  return level === "高" ? "86%" : "52%";
}

function SuggestionCard({ suggestion: s, shown }: { suggestion: Suggestion; shown: boolean }) {
  return (
    <li
      className={cn(
        "rounded-[0.35em] bg-sc-surface px-[0.7em] py-[0.6em] shadow-[0_0_0_1px_rgb(var(--c-fg)/0.08)] transition-[opacity,transform] duration-700",
        shown ? "translate-y-0 opacity-100" : "translate-y-[0.5em] opacity-0"
      )}
    >
      <div className="flex items-center gap-[0.5em]">
        <span
          className={cn(
            "rounded-[0.2em] px-[0.4em] py-[0.1em] text-[0.52em] font-bold",
            s.level === "高" ? "bg-sc-fg text-sc-bg" : "bg-sc-fg/10 text-sc-fg/70"
          )}
        >
          優先度{s.level}
        </span>
        <span className="h-[0.25em] flex-1 overflow-hidden rounded-full bg-sc-fg/10">
          <span
            className="block h-full rounded-full bg-sc-signal transition-[width] delay-300 duration-1000"
            style={{ width: barWidth(shown, s.level) }}
          />
        </span>
      </div>
      <p className="mt-[0.5em] text-[0.58em] leading-relaxed text-sc-fg/60">{s.finding}</p>
      <p className="mt-[0.2em] text-[0.64em] font-bold leading-snug">→ {s.action}</p>
    </li>
  );
}

export function PageVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useStepLoop(ref, DURATIONS);

  return (
    <VisualFrame
      label="Example"
      caption="商品ページとレビュー、競合のページを読み込み、売上に効きそうな順に改善案を出します。タイトルの書き換え案も、その場で作ります。"
      className="p-[1.1em] [@container(min-width:540px)]:aspect-[16/10] [@container(min-width:540px)]:p-[1.4em]"
    >
      <div ref={ref} className="vis-grid absolute inset-0 -z-0" aria-hidden />
      <div className="relative flex h-full flex-col gap-[1em] [@container(min-width:540px)]:flex-row">
        {/* 商品ページ */}
        <div className="flex min-w-0 flex-col overflow-hidden rounded-[0.45em] bg-sc-bg shadow-[0_0_0_1px_rgb(var(--c-fg)/0.1),0_1.4em_2.6em_-1.8em_rgb(var(--c-fg)/0.4)] [@container(min-width:540px)]:w-[60%]">
          <div className="flex items-center gap-[0.35em] border-b border-sc-fg/10 px-[0.8em] py-[0.5em]">
            <span className="h-[0.5em] w-[0.5em] rounded-full bg-sc-fg/15" />
            <span className="h-[0.5em] w-[0.5em] rounded-full bg-sc-fg/15" />
            <span className="h-[0.5em] w-[0.5em] rounded-full bg-sc-fg/15" />
            <span className="ml-[0.6em] truncate rounded-[0.25em] bg-sc-fg/5 px-[0.6em] py-[0.15em] text-[0.55em] text-sc-fg/55">
              shop.example.jp/items/canvas-tote
            </span>
          </div>
          <div className="grid flex-1 grid-cols-[46%_1fr] gap-[0.9em] p-[0.9em]">
            <div className="flex flex-col gap-[0.45em]">
              <ProductPhoto showReviews={step >= 1} />
              <Thumbs proposed={step >= 2} />
            </div>

            <div className="flex min-w-0 flex-col">
              <span className="vis-skel w-[60%] !h-[0.45em]" />
              <div className="relative mt-[0.7em] min-h-[2.8em]">
                <Marker show={step >= 3} className="-left-[1.1em] top-0" />
                <Title rewritten={step >= 3} />
              </div>
              <div className={cn("mt-[0.5em] flex items-center gap-[0.4em] rounded-[0.2em] text-[0.55em]", step === 1 && "vis-scan")}>
                <span className="tracking-[0.1em] text-[#E2A23B]">★★★★☆</span>
                <span className="text-sc-fg/55">4.1（レビュー128件）</span>
              </div>
              <Price moved={step >= 4} />
              <div className="mt-[0.9em] space-y-[0.35em]">
                <span className="vis-skel w-full !h-[0.4em]" />
                <span className="vis-skel w-[92%] !h-[0.4em]" />
                <span className="vis-skel w-[64%] !h-[0.4em]" />
              </div>
              <ColorChips />
              <Cart shippingMoved={step >= 4} />
            </div>
          </div>
        </div>

        {/* 改善案 */}
        <Panel
          title="改善案（優先度順）"
          aside={<AiMark />}
          className="flex min-w-0 flex-col [@container(min-width:540px)]:flex-1"
        >
          <ul className="flex flex-1 flex-col gap-[0.5em] p-[0.7em]">
            {SUGGESTIONS.map((s, i) => (
              <SuggestionCard key={s.action} suggestion={s} shown={step >= i + 2} />
            ))}
          </ul>
        </Panel>
      </div>
    </VisualFrame>
  );
}
