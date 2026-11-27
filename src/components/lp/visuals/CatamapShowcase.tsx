import { ArrowUpRight } from "lucide-react";
import { EXTERNAL_LINKS } from "@/config/company";
import { CatamapVisual } from "./CatamapVisual";

/** 出品業務の章の図。自社SaaS「CataMap」の機能イメージで、図そのものが CataMap の紹介ページへのリンクになる (枠とキャプションは VisualFrame と同じ見た目) */
export function CatamapShowcase() {
  return (
    <figure className="vis">
      <a
        href={EXTERNAL_LINKS.catamap}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="CataMapを見る（新しいタブで開きます）"
        className="group block"
      >
        <div
          className="vis-stage relative min-h-[18rem] overflow-hidden rounded-[4px] bg-sc-surface pb-6 ring-1 ring-sc-fg/10 sm:pb-2"
          aria-hidden
          data-nosnippet
        >
          <CatamapVisual />
          <span className="absolute bottom-3 right-4 flex items-center gap-1 text-[11px] font-bold text-sc-fg/60 transition-colors group-hover:text-sc-fg">
            CataMapを見る
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </a>
      <figcaption className="mt-4 flex flex-col gap-1 text-[13px] leading-[1.9] text-sc-fg/65 sm:flex-row sm:gap-4">
        <span className="t-kicker mt-[0.45em] shrink-0 text-sc-accent">CataMap</span>
        <span>
          商品画像と価格を入れると、楽天市場やYahoo!ショッピングの登録仕様に合わせた商品名・説明文・カテゴリ・属性をAIが作ります。出品中のページも、ストアから読み込んでボタンを押すだけで、カテゴリや商品属性を整えて反映します。
        </span>
      </figcaption>
    </figure>
  );
}
