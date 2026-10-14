import Image from "next/image";

const TAGS = ["メンズ", "シャツ", "半袖", "開襟", "リネン", "セージグリーン", "春夏", "M / L / XL"];

const CATEGORIES = [
  { mall: "楽天市場", path: "メンズファッション › トップス › シャツ" },
  { mall: "Yahoo!ショッピング", path: "ファッション › メンズ › トップス › シャツ" },
];

/** CataMap が何をするか (商品情報からタグとモール別カテゴリを補完) を、サイトの配色で描いた機能イメージ */
export function CatamapVisual() {
  return (
    <div aria-hidden className="vis-grid relative flex h-full items-center justify-center p-6 sm:p-10">
      <div className="grid w-full max-w-[560px] grid-cols-[38%_1fr] gap-4 rounded-[6px] bg-sc-bg p-4 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.1),0_2rem_3rem_-1.8rem_rgb(0_0_0/0.6)] sm:gap-5 sm:p-5">
        <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#E4EAE7]">
          <Image src="/lp/products/shirt.webp" alt="" fill sizes="220px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold text-sc-fg/60">
            <span className="h-2 w-2 rounded-full bg-sc-signal" />
            AIタグ提案
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {TAGS.map((t) => (
              <li
                key={t}
                className="rounded-[3px] bg-sc-signal/15 px-2 py-0.5 text-[12px] font-bold leading-relaxed text-sc-fg/85"
              >
                {t}
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-sc-fg/10 pt-3">
            {CATEGORIES.map((c) => (
              <div key={c.mall}>
                <dt className="text-[11px] font-bold text-sc-fg/60">{c.mall}</dt>
                <dd className="text-[12px] font-bold leading-snug">{c.path}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
