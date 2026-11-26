import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { EXTERNAL_LINKS } from "@/config/company";

/** 併売の章の終わりに置く、自社アプリ「Shopee連携」の紹介 */
export function ShopeeCard() {
  return (
    <article
      data-reveal
      aria-labelledby="shopee-title"
      className="mt-16 overflow-hidden rounded-[4px] bg-sc-surface ring-1 ring-sc-fg/10"
    >
      {/* Shopee連携の紹介ページ冒頭と同じ地図の絵 */}
      <div className="vis-grid relative flex items-center justify-center bg-sc-fg/[0.04] p-5 sm:p-8">
        <figure className="w-full max-w-[560px] overflow-hidden rounded-[6px] bg-[#FEF6F2] shadow-[0_0_0_1px_rgb(var(--c-fg)/0.1),0_2rem_3rem_-1.8rem_rgb(0_0_0/0.6)]">
          <Image
            src="/lp/shopee-map.webp"
            alt=""
            width={1200}
            height={800}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-auto w-full"
          />
          <figcaption className="pb-3 text-center text-[12px] font-bold text-[#555] sm:pb-4 sm:text-[13px]">
            日本から東南アジア・台湾へ
          </figcaption>
        </figure>
      </div>
      <div className="p-7 sm:p-10">
        <p className="t-kicker text-sc-fg/60">Our product</p>
        <h4 id="shopee-title" className="t-h3 mt-5 !text-[clamp(1.75rem,2.6vw,2.375rem)]">
          Shopee連携
        </h4>
        <p className="t-lead mt-3">ネクストエンジンから、すぐにShopeeへ出品。</p>
        <p className="mt-4 text-[15px] leading-[1.95] text-sc-fg/70">
          ネクストエンジンの商品を、Shopeeに出品するアプリです。英語の商品名と説明をAIが下書きし、為替と送料を含めた売価の計算、まとめての出品、在庫の連携までを引き受けます。
        </p>
        <div className="mt-8">
          <a href={EXTERNAL_LINKS.shopeeApp} target="_blank" rel="noopener noreferrer" className="sc-btn sc-btn-ghost">
            <span className="sc-btn-label">Shopee連携を見る</span>
            <span className="sc-btn-icon">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
