import Image from "next/image";

const GRADES = [
  { grade: "S", label: "未使用", price: "¥148,000", w: 100 },
  { grade: "A", label: "美品", price: "¥121,000", w: 82 },
  { grade: "B", label: "使用感あり", price: "¥98,000", w: 66 },
  { grade: "C", label: "傷あり", price: "¥74,000", w: 50 },
];

const CHEAPEST = [
  { mall: "メルカリ", price: "¥109,800" },
  { mall: "ヤフオク!", price: "¥112,000" },
];

/** Catamap Reuse DB が何をするか (売れた価格から状態別の相場と最安出品を出す) を、サイトの配色で描いた機能イメージ */
export function ReuseVisual() {
  return (
    <div aria-hidden className="vis-grid relative flex h-full items-center justify-center p-6 sm:p-10">
      <div className="grid w-full max-w-[560px] grid-cols-[38%_1fr] gap-4 rounded-[6px] bg-sc-bg p-4 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.1),0_2rem_3rem_-1.8rem_rgb(0_0_0/0.6)] sm:gap-5 sm:p-5">
        <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#E4EAE7]">
          <Image src="/lp/products/watch.webp" alt="" fill sizes="220px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold text-sc-fg/60">
            <span className="h-2 w-2 rounded-full bg-sc-signal" />
            売れた価格の中央値
          </p>
          <p className="mt-1 text-[22px] font-bold leading-none tracking-tight sm:text-[26px]">
            ¥112,000
            <span className="ml-2 text-[11px] font-bold text-sc-fg/60">成約 1,284件</span>
          </p>
          <ul className="mt-3 space-y-1.5">
            {GRADES.map((g) => (
              <li key={g.grade} className="grid grid-cols-[1.1rem_1fr_auto] items-center gap-2 text-[11px] font-bold">
                <span className="text-sc-fg/60">{g.grade}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-sc-fg/10">
                  <span className="block h-full rounded-full bg-sc-signal/70" style={{ width: `${g.w}%` }} />
                </span>
                <span className="tabular-nums">{g.price}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-sc-fg/10 pt-3">
            <dt className="text-[11px] font-bold text-sc-fg/60">今いちばん安い出品</dt>
            {CHEAPEST.map((c) => (
              <dd key={c.mall} className="flex items-baseline justify-between text-[12px] font-bold leading-snug">
                <span>{c.mall}</span>
                <span className="tabular-nums">{c.price}</span>
              </dd>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
