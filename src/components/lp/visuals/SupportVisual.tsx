"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { AiMark, CheckIcon, Panel, TypeText, useStepLoop, VisualFrame } from "./shared";

const DURATIONS = [900, 900, 1300, 1100, 2900, 1900];

const SCENARIOS = [
  {
    from: "Emily R.",
    region: "SG",
    subject: "Where is my order?",
    tag: "配送・海外",
    body: "Hi, I ordered a linen shirt last week (#A-2048). When will it arrive in Singapore?",
    note: "訳: 先週リネンシャツを注文しました。シンガポールにはいつ届きますか？",
    refs: ["注文#A-2048", "10月12日 発送済み", "国際配送・追跡番号あり"],
    draft:
      "Hi Emily, thank you for your message. Your order #A-2048 shipped on Oct 12 and should arrive in Singapore within 5–7 business days. You can follow it with the tracking link below.",
  },
  {
    from: "佐藤 様",
    region: "JP",
    subject: "サイズ交換について",
    tag: "返品・交換",
    body: "先日届いたシャツを、MからLに交換したいです。",
    note: "要点: サイズ交換の希望（M → L）",
    refs: ["注文#20481", "10月10日 お届け済み", "交換ルール: 到着後7日以内"],
    draft:
      "佐藤様 お問い合わせありがとうございます。Lサイズへの交換を承ります。同封の返送用伝票で商品をお送りいただければ、到着の確認後にLサイズをお届けします。",
  },
] as const;

const OTHERS = [
  { from: "Daniel K.", subject: "Do you ship to Canada?", tag: "海外" },
  { from: "高橋 様", subject: "再入荷の予定はありますか", tag: "在庫" },
  { from: "山本 様", subject: "領収書の発行について", tag: "その他" },
];

function InboxRow({
  from,
  subject,
  tag,
  active,
  tagged,
  className,
}: {
  from: string;
  subject: string;
  tag: string;
  active?: boolean;
  tagged: boolean;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-[0.6em] rounded-[0.35em] px-[0.6em] py-[0.5em] transition-colors duration-500",
        active && "bg-sc-signal/15",
        className
      )}
    >
      <span className="grid h-[1.9em] w-[1.9em] shrink-0 place-items-center rounded-full bg-sc-fg/10 text-[0.6em] font-bold">
        {from.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.56em] text-sc-fg/55">{from}</span>
        <span className="block truncate text-[0.62em] font-bold">{subject}</span>
      </span>
      <span
        className={cn(
          "shrink-0 rounded-[0.25em] bg-sc-fg/10 px-[0.4em] py-[0.1em] text-[0.52em] font-bold transition-[opacity,transform] duration-500",
          tagged ? "opacity-100" : "translate-x-[0.3em] opacity-0",
          active && "bg-sc-signal text-[#081410]"
        )}
      >
        {tag}
      </span>
    </li>
  );
}

type Scenario = (typeof SCENARIOS)[number];

const fadeIn = (shown: boolean) => (shown ? "opacity-100" : "opacity-0");

function RefChips({ refs, shown }: { refs: Scenario["refs"]; shown: boolean }) {
  return (
    <>
      <p className={cn("mt-[0.3em] text-[0.52em] font-bold text-sc-fg/55 transition-opacity duration-500", fadeIn(shown))}>
        参照した注文情報
      </p>
      <div className="-mt-[0.4em] flex flex-wrap gap-[0.3em]">
        {refs.map((r, i) => (
          <span
            key={r}
            className={cn(
              "rounded-[0.25em] bg-sc-fg/5 px-[0.45em] py-[0.15em] text-[0.54em] font-bold text-sc-fg/70 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.08)] transition-[opacity,transform] duration-500",
              shown ? "translate-y-0 opacity-100" : "translate-y-[0.3em] opacity-0"
            )}
            style={{ transitionDelay: `${i * 0.12}s` }}
          >
            {r}
          </span>
        ))}
      </div>
    </>
  );
}

function SendButton({ sent }: { sent: boolean }) {
  if (!sent) {
    return (
      <span className="rounded-[0.3em] bg-sc-fg px-[0.7em] py-[0.35em] text-[0.56em] font-bold text-sc-bg transition-colors duration-500">
        確認して送信
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[0.3em] rounded-[0.3em] bg-sc-signal px-[0.7em] py-[0.35em] text-[0.56em] font-bold text-[#081410] transition-colors duration-500">
      送信しました
      <CheckIcon />
    </span>
  );
}

/** 返信の下書き。担当者が確かめて送る前提なので、送信ボタンは人が押す形にしている */
function Draft({ text, typing, sent }: { text: string; typing: boolean; sent: boolean }) {
  return (
    <div className="mt-auto rounded-[0.4em] bg-sc-surface p-[0.7em] shadow-[0_0_0_1px_rgb(var(--c-signal)/0.5)]">
      <div className="flex items-center gap-[0.5em]">
        <span className="text-[0.56em] font-bold text-sc-accent">返信の下書き</span>
        <AiMark />
      </div>
      <p className="mt-[0.45em] min-h-[4.6em] text-[0.6em] leading-relaxed">
        <TypeText text={text} active={typing} speed={16} />
      </p>
      <div className="mt-[0.6em] flex justify-end gap-[0.4em]">
        <span className="rounded-[0.3em] px-[0.7em] py-[0.35em] text-[0.56em] font-bold text-sc-fg/60 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.15)]">
          編集する
        </span>
        <SendButton sent={sent} />
      </div>
    </div>
  );
}

export function SupportVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { step, cycle } = useStepLoop(ref, DURATIONS);
  const s = SCENARIOS[cycle % SCENARIOS.length];

  return (
    <VisualFrame
      label="Example"
      caption="問い合わせを内容ごとに仕分け、注文情報を確かめて返信を下書きします。英語などの海外からの問い合わせも同じ流れで処理し、担当者は確認して送るだけです。"
      className="p-[1.1em] [@container(min-width:540px)]:aspect-[16/10] [@container(min-width:540px)]:p-[1.4em]"
    >
      <div ref={ref} className="vis-grid absolute inset-0" aria-hidden />
      <div className="relative flex h-full flex-col gap-[0.9em] [@container(min-width:540px)]:flex-row">
        <Panel title="受信箱" aside={<AiMark />} className="shrink-0 [@container(min-width:540px)]:w-[37%]">
          <ul className="space-y-[0.2em] p-[0.45em]">
            <InboxRow key={cycle} from={s.from} subject={s.subject} tag={s.tag} active tagged={step >= 1} className="vis-pop" />
            {OTHERS.map((o, i) => (
              <InboxRow
                key={o.subject}
                from={o.from}
                subject={o.subject}
                tag={o.tag}
                tagged
                className={cn(i === 2 && "hidden [@container(min-width:540px)]:flex")}
              />
            ))}
          </ul>
        </Panel>

        <Panel
          title={`${s.from}（${s.region}）`}
          aside={<span className="text-[0.55em] text-sc-fg/55">{s.subject}</span>}
          className="flex min-w-0 flex-1 flex-col"
        >
          <div key={cycle} className="flex flex-1 flex-col gap-[0.7em] p-[0.9em]">
            <p className="text-[0.64em] font-bold leading-relaxed">{s.body}</p>
            <p className={cn("text-[0.58em] leading-relaxed text-sc-fg/55 transition-opacity duration-500", fadeIn(step >= 2))}>
              {s.note}
            </p>
            <RefChips refs={s.refs} shown={step >= 3} />
            <Draft text={s.draft} typing={step >= 4} sent={step >= 5} />
          </div>
        </Panel>
      </div>
    </VisualFrame>
  );
}
