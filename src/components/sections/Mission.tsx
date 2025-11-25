"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Lightbulb, Rocket } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "ビジョン",
    description: "すべての人の自由な時間を増やし、幸福を最大化する未来を創る",
    gradient: "from-brand-green to-brand-teal",
  },
  {
    icon: Lightbulb,
    title: "イノベーション",
    description: "最先端技術を駆使し、ビジネスプロセスの高度化を実現する",
    gradient: "from-brand-teal to-brand-cyan",
  },
  {
    icon: Rocket,
    title: "成長",
    description: "お客様と共に歩み、予測不可能な時代を切り開くパートナーとして成長",
    gradient: "from-brand-cyan to-brand-blue",
  },
];

export function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="mission"
      ref={ref}
      className="relative py-32 overflow-hidden"
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute inset-0 pattern-grid" />
      
      {/* 装飾的なグラデーション */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative container mx-auto px-6">
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-sm font-medium mb-6">
            Our Mission
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-deep mb-6">
            ミッション
          </h2>
          <div className="w-20 h-1 bg-gradient-brand mx-auto rounded-full" />
        </motion.div>

        {/* メインメッセージ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <p className="text-xl md:text-2xl text-brand-deep/80 leading-relaxed">
            私たちは、<span className="text-gradient font-bold">最先端テクノロジー</span>を駆使し、
            お客様のビジネスプロセスと意思決定の高度化のサポートを提供いたします。
          </p>
          <p className="text-lg md:text-xl text-brand-deep/60 leading-relaxed mt-6">
            確かな技術力と豊富な経験を活かし、お客様と共に歩み成長しながら、
            予測不可能な時代を切り開くパートナーとして、お客様の成功に貢献してまいります。
          </p>
        </motion.div>

        {/* バリューカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
              className="group"
            >
              <div className="relative h-full p-8 rounded-3xl bg-white shadow-xl shadow-brand-green/5 border border-brand-green/10 hover:shadow-2xl hover:shadow-brand-teal/10 transition-all duration-500 hover:-translate-y-2">
                {/* アイコン */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${value.gradient} mb-6 shadow-lg`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>

                {/* コンテンツ */}
                <h3 className="text-xl font-display font-bold text-brand-deep mb-4">
                  {value.title}
                </h3>
                <p className="text-brand-deep/60 leading-relaxed">
                  {value.description}
                </p>

                {/* ホバー時のグラデーションライン */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${value.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
