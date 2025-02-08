"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerChildren } from "@/config/animations";
import Image from "next/image";

const services = [
  {
    title: "ホームページ・LP・Webアプリ制作",
    description:
      "Webサイトやアプリケーションの開発において、Next.js、React、TypeScriptなどの最新技術を活用し、お客様のニーズに合わせた高品質なソリューションを提供いたします。業務効率化のための社内システムから、集客を目的としたコーポレートサイトまで、豊富な実績と技術力で迅速に対応させていただきます。",
    image: "/services/web-development.jpg",
  },
  {
    title: "データ分析基盤構築",
    description:
      "データを活用した意思決定支援のため、クラウド技術を駆使してデータ収集・分析基盤を構築。経営判断に必要な洞察を導き出し、ビジネスの成長を加速させます。",
    image: "/services/data-analytics.jpg",
  },
  {
    title: "ツール開発",
    description:
      "煩雑な業務プロセスを自動化し、人的ミスを削減。カスタマイズ性の高い業務効率化ツールで、作業時間を大幅に短縮し、本質的な業務に集中できる環境を実現します。",
    image: "/services/automation.jpg",
  },
  {
    title: "EC構築・運営支援",
    description:
      "ECサイトの構築・運営・マルチチャネルでの在庫管理・販売フロー構築をサポート。",
    image: "/services/ec-support.jpg",
  },
] as const;

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.h2
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-4xl font-bold mb-12 text-center text-support-blue-dark"
        >
          サービス
        </motion.h2>
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group border border-support-blue-light rounded-lg overflow-hidden hover:border-accent transition-all duration-300"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-support-blue-dark">
                  {service.title}
                </h3>
                <p className="text-primary/80 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
