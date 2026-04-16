"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ExternalLink, Bell, TrendingDown, Mail, Map, Tag, ArrowLeftRight } from "lucide-react";

const products = [
  {
    name: "Tra-bell",
    tagline: "そのホテル予約、まだ安くなります",
    description:
      "宿泊ホテルの価格を24時間365日自動監視するAIサービス。楽天トラベルやじゃらんで予約済みのホテルについて、キャンセル料発生前に値下げを検知し、よりお得なプランへの乗り換えを提案します。",
    image: "/products/tra-bell.png",
    url: "https://www.tra-bell.com",
    status: "Beta",
    features: [
      { icon: TrendingDown, label: "AI価格監視" },
      { icon: Bell, label: "値下げ通知" },
      { icon: Mail, label: "LINE/メール連携" },
    ],
    gradient: "from-brand-green to-brand-teal",
  },
  {
    name: "型マップ",
    tagline: "複数モールのカテゴリ変換を、一度きりの定義で。",
    description:
      "ECモール間のカテゴリ変換・商品属性マッピングを一元管理するSaaSサービス。楽天・Amazon・Yahoo!ショッピングなど複数モールへの出品時に生じるカテゴリ構造の違いや属性項目のズレを、「型」として定義するだけで自動変換。手作業によるカテゴリ付け替えや属性の再入力をゼロにし、マルチモール運営の効率を大幅に向上させます。",
    image: "/products/catamap.png",
    url: "https://catamap.app",
    status: "New",
    features: [
      { icon: Map, label: "カテゴリマッピング" },
      { icon: Tag, label: "商品属性管理" },
      { icon: ArrowLeftRight, label: "モール間変換" },
    ],
    gradient: "from-brand-cyan to-brand-blue",
  },
] as const;

export function ProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="products"
      ref={ref}
      className="relative py-32 overflow-hidden"
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute inset-0 pattern-dots opacity-40" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-brand-cyan/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-brand-green/8 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6">
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-cyan/10 text-brand-cyan text-sm font-medium mb-6">
            Our Products
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-deep mb-6">
            自社プロダクト
          </h2>
          <div className="w-20 h-1 bg-gradient-brand mx-auto rounded-full" />
          <p className="mt-6 text-lg text-brand-deep/60 max-w-2xl mx-auto">
            自社で企画・設計・開発したプロダクトを公開しています
          </p>
        </motion.div>

        {/* プロダクトカード */}
        {products.map((product, index) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative rounded-3xl overflow-hidden bg-white border border-brand-green/10 shadow-xl shadow-brand-green/5 hover:shadow-2xl hover:shadow-brand-teal/10 transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* スクリーンショット */}
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={`${product.name} - ${product.tagline}`}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/5" />

                    {/* ステータスバッジ */}
                    <div className="absolute top-6 left-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${product.gradient} text-white shadow-lg`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl lg:text-3xl font-display font-bold text-brand-deep group-hover:text-brand-teal transition-colors">
                        {product.name}
                      </h3>
                      <ExternalLink className="w-5 h-5 text-brand-deep/30 group-hover:text-brand-teal transition-colors" />
                    </div>

                    <p className="text-lg font-medium text-gradient mb-4">
                      {product.tagline}
                    </p>

                    <p className="text-brand-deep/60 leading-relaxed mb-8">
                      {product.description}
                    </p>

                    {/* 機能タグ */}
                    <div className="flex flex-wrap gap-3">
                      {product.features.map((feature) => (
                        <div
                          key={feature.label}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/5 border border-brand-green/10 text-brand-deep/70 text-sm font-medium"
                        >
                          <feature.icon className="w-4 h-4 text-brand-teal" />
                          {feature.label}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-8">
                      <span className="inline-flex items-center gap-2 text-brand-teal font-medium group-hover:gap-3 transition-all">
                        サービスを見る
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* ボトムグラデーション */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
