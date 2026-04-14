"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Brain, ShoppingCart, ArrowUpRight, CheckCircle2 } from "lucide-react";

const services = [
  {
    title: "AI開発",
    description:
      "生成AI・LLMを活用したシステム開発で、ビジネスプロセスを革新。お客様の課題に合わせたAIソリューションを最短で構築します。",
    image: "/services/automation.jpg",
    icon: Brain,
    gradient: "from-brand-green to-brand-cyan",
    features: ["生成AI / LLM", "業務自動化", "チャットボット開発"],
    cases: [
      "ECサイトのカスタマー返信自動化アプリ",
      "ECモールのカテゴリ・スペック・商品属性の自動付与アプリ",
      "競合サイトAI分析ツール",
    ],
  },
  {
    title: "EC構築・運営支援",
    description:
      "ECサイトの構築・運営・マルチチャネルでの在庫管理・販売フロー構築をトータルサポート。売上最大化を実現します。",
    image: "/services/ec-support.jpg",
    icon: ShoppingCart,
    gradient: "from-brand-cyan to-brand-blue",
    features: ["ECプラットフォーム", "在庫管理", "マルチチャネル"],
    cases: [
      "併売ツール導入の支援",
      "分析・業務効率化ツールの開発",
    ],
  },
] as const;

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="services"
      ref={ref}
      className="relative py-32 bg-white overflow-hidden"
    >
      {/* 装飾的な背景 */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6">
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-medium mb-6">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-deep mb-6">
            サービス
          </h2>
          <div className="w-20 h-1 bg-gradient-brand mx-auto rounded-full" />
          <p className="mt-6 text-lg text-brand-deep/60 max-w-2xl mx-auto">
            AI技術と確かな経験で、お客様のビジネスを成功へ導きます
          </p>
        </motion.div>

        {/* サービスグリッド - 2カード均等 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="group"
            >
              <div className="relative h-full rounded-3xl overflow-hidden bg-white border border-brand-green/10 shadow-xl shadow-brand-green/5 hover:shadow-2xl hover:shadow-brand-teal/10 transition-all duration-500">
                {/* 画像エリア */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-30`}
                  />

                  {/* フローティングアイコン */}
                  <motion.div
                    className="absolute top-6 left-6 p-4 rounded-2xl glass shadow-xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <service.icon className="w-7 h-7 text-brand-deep" />
                  </motion.div>

                  {/* ホバー時のオーバーレイ */}
                  <div className="absolute inset-0 bg-brand-deep/0 group-hover:bg-brand-deep/20 transition-colors duration-500 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="flex items-center gap-2 px-6 py-3 rounded-full glass text-brand-deep font-medium">
                        詳しく見る
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* コンテンツエリア */}
                <div className="p-8">
                  <h3 className="text-xl font-display font-bold text-brand-deep mb-4 group-hover:text-brand-teal transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-brand-deep/60 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* 実績 */}
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-deep/40 mb-3">
                      実績
                    </p>
                    <ul className="space-y-2">
                      {service.cases.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-brand-deep/70"
                        >
                          <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 機能タグ */}
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${service.gradient} text-white/90`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ボトムグラデーション */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
