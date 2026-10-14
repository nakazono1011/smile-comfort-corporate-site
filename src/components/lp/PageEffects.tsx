"use client";

import { useEffect } from "react";
import Lenis from "lenis";

type Cleanup = () => void;

const MODIFIER_KEYS = ["metaKey", "ctrlKey", "shiftKey", "altKey"] as const;

/** 修飾キーなしの左クリックで、まだ誰も処理していないか */
const isPlainClick = (e: MouseEvent) =>
  !e.defaultPrevented && e.button === 0 && !MODIFIER_KEYS.some((k) => e[k]);

/** クリックされたリンクの href (リンク以外なら null) */
const anchorHref = (target: EventTarget | null) =>
  target instanceof Element ? (target.closest("a[href]")?.getAttribute("href") ?? null) : null;

/** "#id" と "/#id" から id を取り出す */
const hashId = (href: string | null) => href?.match(/^\/?#(.+)$/)?.[1];

const elementById = (id: string | undefined) =>
  id ? document.getElementById(decodeURIComponent(id)) : null;

/** 次の Tab 移動が移動先から続くよう、移動先へフォーカスを移す */
function focusSection(el: HTMLElement) {
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/**
 * 慣性スクロール (Lenis)。動きを減らす設定の環境では使わない。
 * ページ内リンク (#id と /#id) も Lenis だけで移動させる (ブラウザ既定のジャンプと二重に動くとちらつくため)
 */
function setupSmoothScroll(): Cleanup {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const lenis = new Lenis({ lerp: 0.11, autoRaf: true });

  const onAnchorClick = (e: MouseEvent) => {
    if (!isPlainClick(e)) return;
    const id = hashId(anchorHref(e.target));
    const target = elementById(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { onComplete: () => focusSection(target) });
    history.replaceState(history.state, "", `#${id}`);
  };
  document.addEventListener("click", onAnchorClick, true);

  return () => {
    lenis.destroy();
    document.removeEventListener("click", onAnchorClick, true);
  };
}

const themeOf = (entry: IntersectionObserverEntry) =>
  entry.isIntersecting ? (entry.target as HTMLElement).dataset.sectionTheme : undefined;

/**
 * 画面の縦中央の 2px を判定帯にし、そこに掛かっているセクションの data-section-theme を .sc-root に反映する。
 * rootMargin の % は幅基準で解釈されうるため、高さから px で組み立て、リサイズで作り直す
 */
function setupThemeSwitch(): Cleanup {
  const root = document.querySelector<HTMLElement>(".sc-root");
  const themed = document.querySelectorAll("[data-section-theme]");
  let io: IntersectionObserver | null = null;

  const observe = () => {
    io?.disconnect();
    const half = Math.floor(window.innerHeight / 2) - 1;
    io = new IntersectionObserver(
      (entries) => {
        const theme = entries.map(themeOf).filter(Boolean).pop();
        if (theme && root) root.dataset.theme = theme;
      },
      { rootMargin: `-${half}px 0px -${half}px 0px` }
    );
    themed.forEach((el) => io?.observe(el));
  };
  observe();

  let timer = 0;
  const onResize = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(observe, 200);
  };
  window.addEventListener("resize", onResize);

  return () => {
    io?.disconnect();
    window.clearTimeout(timer);
    window.removeEventListener("resize", onResize);
  };
}

/** data-reveal を持つ要素が画面に入ったら data-in を付ける (一度だけ) */
function setupReveal(): Cleanup {
  const io = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        });
    },
    { rootMargin: "0px 0px -12% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/** 要素の上端が画面の 90% に来たら 0、最終行が画面中央に来たら 1 */
const progressOf = (r: DOMRect, vh: number) =>
  Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.4 + r.height)));

/** 画面から大きく外れている要素は計算を省く */
const isNearViewport = (r: DOMRect, vh: number) => r.bottom >= -vh && r.top <= vh * 2;

/** data-progress を持つ要素に、通過量 0〜1 を CSS 変数 --p として書き込む */
function setupProgress(): Cleanup {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
  let raf = 0;

  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (isNearViewport(r, vh)) el.style.setProperty("--p", progressOf(r, vh).toFixed(4));
    });
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    cancelAnimationFrame(raf);
  };
}

/** LP 全体の演出をまとめて仕掛ける (描画するものはない) */
export function PageEffects() {
  useEffect(() => {
    const cleanups = [setupSmoothScroll(), setupThemeSwitch(), setupReveal(), setupProgress()];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
