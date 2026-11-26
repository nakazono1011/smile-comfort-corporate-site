import { ArrowUpRight } from "lucide-react";
import { EXTERNAL_LINKS } from "@/config/company";
import { CatamapVisual } from "./CatamapVisual";
import { VisualFrame } from "./shared";

/** 出品業務の章の図。自社SaaS「CataMap」の機能イメージで、図そのものが CataMap の紹介ページへのリンクになる */
export function CatamapShowcase() {
  return (
    <VisualFrame
      label="CataMap"
      caption="商品画像と価格を入れると、楽天市場やYahoo!ショッピングの登録仕様に合わせた商品名・説明文・カテゴリ・属性をAIが作ります。出品中のページも、ストアから読み込んでボタンを押すだけで、カテゴリや商品属性を整えて反映します。"
      className="min-h-[18rem] pb-6 sm:pb-2"
      link={{ href: EXTERNAL_LINKS.catamap, label: "CataMapを見る（新しいタブで開きます）" }}
    >
      <CatamapVisual />
      <span className="absolute bottom-3 right-4 flex items-center gap-1 text-[11px] font-bold text-sc-fg/60 transition-colors group-hover:text-sc-fg">
        CataMapを見る
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </VisualFrame>
  );
}
