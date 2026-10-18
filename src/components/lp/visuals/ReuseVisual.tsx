import Image from "next/image";

const PARSED = [
  { k: "型番", v: "AB-1234" },
  { k: "状態", v: "A・小傷あり" },
  { k: "付属品", v: "箱・保証書" },
  { k: "素材", v: "SS・革ベルト" },
];

const COMPARABLES = [
  { label: "同条件の個体", price: "¥118,000", match: true },
  { label: "同条件の個体", price: "¥121,500", match: true },
  { label: "付属品なし", price: "¥96,000", match: false },
  { label: "別型番", price: "¥158,000", match: false },
];

/** Catamap Reuse DB が何をするか (AI が一点ずつ解析して違いを揃え、比較できる個体だけから相場を出す) を、サイトの配色で描いた機能イメージ */
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
            AIが一点ずつ解析
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {PARSED.map((p) => (
              <li
                key={p.k}
                className="rounded-[3px] bg-sc-signal/15 px-2 py-0.5 text-[12px] font-bold leading-relaxed text-sc-fg/85"
              >
                <span className="text-sc-fg/55">{p.k} </span>
                {p.v}
              </li>
            ))}
          </ul>
          <ul className="mt-3 space-y-1 border-t border-sc-fg/10 pt-3">
            {COMPARABLES.map((c, i) => (
              <li
                key={i}
                className={`flex items-baseline justify-between text-[12px] font-bold leading-snug ${c.match ? "" : "text-sc-fg/35 line-through decoration-sc-fg/30"}`}
              >
                <span>{c.label}</span>
                <span className="tabular-nums">{c.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-baseline justify-between border-t border-sc-fg/10 pt-3">
            <span className="text-[11px] font-bold text-sc-fg/60">比較できる個体の相場</span>
            <span className="text-[20px] font-bold leading-none tracking-tight tabular-nums sm:text-[22px]">¥119,000</span>
          </p>
        </div>
      </div>
    </div>
  );
}
