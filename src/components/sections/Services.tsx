"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Globe, Database, Cog, ShoppingCart, ArrowUpRight } from "lucide-react";

const services = [
  {
    title: "ホームページ・LP・Webアプリ制作",
    description:
      "Webサイトやアプリケーションの開発において、Next.js、React、TypeScriptなどの最新技術を活用し、お客様のニーズに合わせた高品質なソリューションを提供いたします。",
    image: "/services/web-development.jpg",
    icon: Globe,
    gradient: "from-brand-green to-brand-teal",
    features: ["Next.js / React", "TypeScript", "レスポンシブ対応"],
  },
  {
    title: "データ分析基盤構築",
    description:
      "データを活用した意思決定支援のため、クラウド技術を駆使してデータ収集・分析基盤を構築。経営判断に必要な洞察を導き出します。",
    image: "/services/data-analytics.jpg",
    icon: Database,
    gradient: "from-brand-teal to-brand-cyan",
    features: ["AWS / GCP", "データパイプライン", "BI連携"],
  },
  {
    title: "ツール開発",
    description:
      "煩雑な業務プロセスを自動化し、人的ミスを削減。カスタマイズ性の高い業務効率化ツールで、作業時間を大幅に短縮します。",
    image: "/services/automation.jpg",
    icon: Cog,
    gradient: "from-brand-cyan to-brand-blue",
    features: ["業務自動化", "カスタムツール", "API連携"],
  },
  {
    title: "EC構築・運営支援",
    description:
      "ECサイトの構築・運営・マルチチャネルでの在庫管理・販売フロー構築をトータルサポート。売上最大化を実現します。",
    image: "/services/ec-support.jpg",
    icon: ShoppingCart,
    gradient: "from-brand-blue to-brand-green",
    features: ["ECプラットフォーム", "在庫管理", "マルチチャネル"],
  },
] as const;

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" ref={ref} className="relative py-32 bg-white overflow-hidden">
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
            最新技術と確かな経験で、お客様のビジネスを成功へ導きます
          </p>
        </motion.div>

        {/* サービスグリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
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
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-60`} />
                  
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
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
