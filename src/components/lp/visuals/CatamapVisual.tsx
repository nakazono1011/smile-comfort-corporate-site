import Image from "next/image";

const TAGS = ["メンズ", "シャツ", "半袖", "開襟", "リネン", "セージグリーン", "春夏", "M / L / XL"];

const CATEGORIES = [
  { mall: "楽天市場", icon: "rakuten", path: "メンズファッション › トップス › シャツ" },
  { mall: "Yahoo!ショッピング", icon: "yahoo", path: "ファッション › メンズ › トップス › シャツ" },
  { mall: "ヤフオク", icon: "yahoo-auction", path: "ファッション › メンズファッション › シャツ" },
  { mall: "メルカリShops", icon: "mercari", path: "メンズ › トップス › シャツ" },
];

/** CataMap が何をするか (商品に合わせた属性タグと、モールごとのカテゴリ) を、サイトの配色で描いた機能イメージ。出品業務の章の図になる */
export function CatamapVisual() {
  return (
    // 架空の値 (価格・型番・タグ) を検索結果の抜粋や AI の回答に使わせない
    <div aria-hidden data-nosnippet className="vis-grid relative flex h-full items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[560px] rounded-[6px] bg-sc-bg p-4 shadow-[0_0_0_1px_rgb(var(--c-fg)/0.1),0_2rem_3rem_-1.8rem_rgb(0_0_0/0.6)] sm:p-5">
        <Image src="/lp/catamap/logo-wordmark.png" alt="" width={480} height={120} className="h-5 w-auto sm:h-6" />
        <div className="mt-4 grid grid-cols-[38%_1fr] gap-4 border-t border-sc-fg/10 pt-4 sm:gap-5">
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
                  <dt className="flex items-center gap-1.5 text-[11px] font-bold text-sc-fg/60">
                    <Image
                      src={`/lp/catamap/${c.icon}.png`}
                      alt=""
                      width={40}
                      height={40}
                      className="h-4 w-4 rounded-[4px] border border-[#E5E7EB] bg-white object-contain"
                    />
                    {c.mall}
                  </dt>
                  <dd className="text-[12px] font-bold leading-snug">{c.path}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
