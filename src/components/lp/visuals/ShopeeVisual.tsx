import Image from "next/image";

const DRAFT = [
  { k: "カテゴリ", v: "Women Bags › Tote Bags" },
  { k: "重量", v: "推定 380 g", check: true },
];

const PRICE_STEPS = ["上乗せ率", "為替", "送料", "Shopeeの売価"];

const DONE = ["まとめて出品", "在庫連携"];

/** Shopee連携が何をするか (ネクストエンジンの商品から AI が英語の下書きを作り、売価を計算して Shopee に出品) を、サイトの配色で描いた機能イメージ */
export function ShopeeVisual() {
  return (
    // 架空の値 (価格・型番・タグ) を検索結果の抜粋や AI の回答に使わせない
    <div aria-hidden data-nosnippet className="vis-grid relative flex h-full items-center justify-center p-6 sm:p-10">
      <div className="grid w-full max-w-[560px] grid-cols-[38%_1fr] gap-4 rounded-[6px] bg-sc-bg p-4 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.1),0_2rem_3rem_-1.8rem_rgb(0_0_0/0.6)] sm:gap-5 sm:p-5">
        <div className="min-w-0">
          <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#E4EAE7]">
            <Image src="/lp/products/tote.webp" alt="" fill sizes="220px" className="object-cover" />
          </div>
          <p className="mt-2 text-[11px] font-bold text-sc-fg/60">ネクストエンジンの商品</p>
          <p className="text-[12px] font-bold leading-snug">キャンバス トートバッグ</p>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold text-sc-fg/60">
            <span className="h-2 w-2 rounded-full bg-sc-signal" />
            AIが英語で下書き
          </p>
          <p className="mt-2 rounded-[3px] bg-sc-signal/15 px-2 py-1 text-[12px] font-bold leading-relaxed text-sc-fg/85">
            Canvas Tote Bag Natural Leather Handles [Direct from Japan]
          </p>
          <dl className="mt-2 space-y-1">
            {DRAFT.map((r) => (
              <div key={r.k} className="flex items-baseline justify-between gap-3 text-[12px] font-bold leading-snug">
                <dt className="shrink-0 text-[11px] text-sc-fg/60">{r.k}</dt>
                <dd className="truncate">
                  {r.v}
                  {r.check && (
                    <span className="ml-1.5 rounded-[3px] bg-sc-fg/10 px-1.5 py-0.5 text-[10px] text-sc-fg/70">要確認</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 border-t border-sc-fg/10 pt-3">
            <p className="text-[11px] font-bold text-sc-fg/60">売価の計算</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] font-bold leading-snug">
              <span className="tabular-nums">¥2,980</span>
              {PRICE_STEPS.map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="text-sc-fg/40">›</span>
                  <span className="rounded-[3px] bg-sc-fg/[0.06] px-1.5 py-0.5">{s}</span>
                </span>
              ))}
            </p>
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-sc-fg/10 pt-3">
            {DONE.map((d) => (
              <li key={d} className="flex items-center gap-1.5 text-[12px] font-bold text-sc-fg/85">
                <span className="h-1.5 w-1.5 rounded-full bg-sc-signal" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
