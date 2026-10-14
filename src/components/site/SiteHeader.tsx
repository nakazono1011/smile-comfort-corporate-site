"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "サービス", id: "services" },
  { label: "対応範囲", id: "scope" },
  { label: "進め方", id: "approach" },
  { label: "実績", id: "works" },
  { label: "会社概要", id: "company" },
] as const;

/** 画面に表示されている、フォーカスできるリンクとボタン */
const visibleFocusables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>("a[href], button")).filter(
    (el) => el.offsetParent !== null
  );

/** Tab の移動を root の中で循環させる (末尾から先頭へ、Shift+Tab なら先頭から末尾へ) */
function trapTab(e: KeyboardEvent, root: HTMLElement) {
  const items = visibleFocusables(root);
  const [from, to] = e.shiftKey ? [items[0], items.at(-1)] : [items.at(-1), items[0]];
  if (document.activeElement !== from || !to) return;
  e.preventDefault();
  to.focus();
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > lastY + 6 && y > 240) setHidden(true);
      else if (y < lastY - 6) setHidden(false);
      lastY = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      // メニューを開いている間は、Tab での移動をヘッダー内 (開閉ボタンとメニュー) に閉じ込める
      if (e.key === "Tab" && headerRef.current) trapTab(e, headerRef.current);
    };
    // デスクトップ幅ではメニューを使わないので、幅が広がったら閉じる
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onResize);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      desktop.removeEventListener("change", onResize);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      ref={headerRef}
      // 隠れている間に Tab でヘッダーへ戻ってきたら表示し直す
      onFocusCapture={() => setHidden(false)}
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-sc-fg transition-[transform,background-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out-expo)]",
        hidden && !open && "-translate-y-full",
        open && "sc-dark !bg-transparent",
        scrolled && !open
          ? "bg-sc-bg/80 shadow-[0_1px_0_rgb(var(--c-fg)/0.08)] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="sc-wrap relative z-10 flex h-20 items-center justify-between gap-6">
        <Link href="/" onClick={close} className="flex items-center gap-3" aria-label="Smile Comfort トップページ">
          <Image src="/logo.png" alt="" width={36} height={36} priority className="h-9 w-9" />
          <span className="t-wide text-[15px] font-semibold tracking-tight">Smile Comfort</span>
        </Link>

        <nav aria-label="メインメニュー" className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <a key={n.id} href={href(n.id)} className="sc-link text-sm font-bold">
              {n.label}
            </a>
          ))}
          <Link href="/media" className="sc-link text-sm font-bold">
            メディア
          </Link>
          <a href={href("contact")} className="sc-btn ml-2 !h-11 !text-sm">
            <span className="sc-btn-label !px-5">相談する</span>
            <span className="sc-btn-icon !w-11">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="flex h-11 items-center gap-3 text-sm font-bold lg:hidden"
        >
          {open ? "閉じる" : "メニュー"}
          <span aria-hidden className="relative h-3 w-6">
            <span
              className={cn(
                "absolute inset-x-0 top-0 h-[2px] bg-current transition-transform duration-500",
                open && "translate-y-[5px] rotate-45"
              )}
            />
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-[2px] bg-current transition-transform duration-500",
                open && "-translate-y-[5px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      <div
        id="site-menu"
        ref={menuRef}
        hidden={!open}
        className="sc-dark fixed inset-0 h-[100dvh] overflow-y-auto pb-10 pt-24 lg:hidden"
        data-lenis-prevent
      >
        <nav aria-label="メインメニュー（スマートフォン）" className="sc-wrap">
          <ul className="border-t border-sc-fg/15">
            {[...NAV, { label: "お問い合わせ", id: "contact" }].map((n, i) => (
              <li
                key={n.id}
                className="menu-item border-b border-sc-fg/15"
                style={{ "--i": i } as React.CSSProperties}
              >
                <a href={href(n.id)} onClick={close} className="t-h3 block py-5 !text-[2rem]">
                  {n.label}
                </a>
              </li>
            ))}
            <li
              className="menu-item border-b border-sc-fg/15"
              style={{ "--i": NAV.length + 1 } as React.CSSProperties}
            >
              <Link href="/media" onClick={close} className="t-h3 block py-5 !text-[2rem]">
                メディア
              </Link>
            </li>
          </ul>
          <a href={href("contact")} onClick={close} className="sc-btn mt-10 w-full justify-between">
            <span className="sc-btn-label">相談する</span>
            <span className="sc-btn-icon">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
