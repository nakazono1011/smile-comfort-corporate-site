"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

const reducedQuery = "(prefers-reduced-motion: reduce)";

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false
  );
}

export function useInView(ref: RefObject<Element | null>, margin = "0px 0px -15% 0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: margin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

/**
 * 画面に入っている間だけ、durations[i] ミリ秒ごとにstepを進めてループする。
 * 動きを減らす設定では最後のstepで止める。
 */
export function useStepLoop(ref: RefObject<Element | null>, durations: number[]) {
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);
  const last = durations.length - 1;

  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => {
      if (step >= last) {
        setStep(0);
        setCycle((c) => c + 1);
      } else {
        setStep(step + 1);
      }
    }, durations[step]);
    return () => window.clearTimeout(t);
  }, [inView, reduced, step, last, durations]);

  return { step: reduced ? last : step, cycle, reduced };
}

/** activeになったら1文字ずつ表示する */
export function TypeText({
  text,
  active,
  speed = 28,
  className,
}: {
  text: string;
  active: boolean;
  speed?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!active || reduced) return;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= text.length) window.clearInterval(id);
    }, speed);
    return () => {
      window.clearInterval(id);
      setCount(0);
    };
  }, [active, reduced, text, speed]);

  const shown = shownCount(reduced, active, count, text.length);
  return (
    <span className={className}>
      {text.slice(0, shown)}
      <Caret visible={active && shown < text.length} />
    </span>
  );
}

/** 動きを減らす設定では、表示中なら全文を一度に出す */
function shownCount(reduced: boolean, active: boolean, count: number, length: number) {
  if (!reduced) return count;
  return active ? length : 0;
}

function Caret({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <span className="ml-[0.05em] inline-block h-[1em] w-[0.08em] translate-y-[0.15em] bg-sc-signal" />;
}

/** 事例イラストの枠。中身はem単位で組み、枠の幅に合わせて拡大縮小する */
export function VisualFrame({
  label,
  caption,
  children,
  className,
  narrowScale = 26,
}: {
  label: string;
  caption: string;
  children: ReactNode;
  className?: string;
  /** 幅が狭いとき、枠の幅を何emとみなすか (大きいほど文字が小さい) */
  narrowScale?: number;
}) {
  return (
    <figure className="vis">
      <div
        className={cn(
          "vis-stage relative overflow-hidden rounded-[4px] bg-sc-surface ring-1 ring-sc-fg/10",
          className
        )}
        style={{ "--vis-n": narrowScale } as React.CSSProperties}
        aria-hidden
        // 架空の文言 (模擬の問い合わせなど) を検索結果の抜粋に使わせない
        data-nosnippet
      >
        {children}
      </div>
      <figcaption className="mt-4 flex flex-col gap-1 text-[13px] leading-[1.9] text-sc-fg/65 sm:flex-row sm:gap-4">
        <span className="t-kicker mt-[0.45em] shrink-0 text-sc-accent">{label}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

export function Panel({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.45em] bg-sc-bg/70 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.09),0_1.2em_2.4em_-1.6em_rgb(var(--c-fg)/0.35)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-sc-fg/10 px-[0.9em] py-[0.55em]">
        <span className="text-[0.72em] font-bold text-sc-fg/70">{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function AiMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "t-wide inline-flex items-center gap-[0.35em] rounded-[0.25em] bg-sc-signal/15 px-[0.45em] py-[0.2em] text-[0.62em] font-semibold text-sc-accent",
        className
      )}
    >
      <span className="h-[0.5em] w-[0.5em] rounded-full bg-sc-signal" />
      AI
    </span>
  );
}

/** 値が変わるたびに下から差し替わる数字 */
export function FlipNumber({ value, className }: { value: number | string; className?: string }) {
  return (
    <span className={cn("relative inline-block overflow-hidden align-bottom", className)}>
      <span key={value} className="vis-flip inline-block">
        {value}
      </span>
    </span>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={cn("inline-block h-[0.9em] w-[0.9em]", className)} aria-hidden>
      <path d="M2.5 6.3 5 8.6l4.6-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
