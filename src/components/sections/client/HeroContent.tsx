"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowDown, Clock, Brain, Bot, ShoppingCart, Cog } from "lucide-react";
import { scrollToElement } from "@/lib/scroll";

const serviceChips = [
  { icon: Brain, label: "AI開発" },
  { icon: Bot, label: "生成AI / LLM" },
  { icon: Cog, label: "業務自動化" },
  { icon: ShoppingCart, label: "EC支援" },
] as const;

export function HeroContent() {
  const prefersReducedMotion = useReducedMotion();
  const scrollLoop = prefersReducedMotion
    ? { duration: 0 as const }
    : { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="relative flex-1 w-full">
      {/* 背景画像 */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/hero.webp"
          alt="合同会社スマイルコンフォート - アイデアをプロダクトに"
          fill
          className="object-cover"
          priority
          quality={70}
          sizes="100vw"
        />

        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/90 via-brand-deep/70 to-brand-blue/60" />

        {/* メッシュグラデーション効果 */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-green/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-brand-cyan/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-brand-blue/30 rounded-full blur-3xl" />
        </div>

        {/* パターンオーバーレイ */}
        <div className="absolute inset-0 pattern-dots opacity-30" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center pt-24 pb-20 text-center">
        <div className="max-w-4xl">
          {/* サービスチップ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8"
          >
            {serviceChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs sm:text-sm font-medium"
              >
                <chip.icon className="w-3.5 h-3.5" />
                {chip.label}
              </span>
            ))}
          </motion.div>

          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-[1.15] tracking-tight"
          >
            <span className="block text-white">アイデアを、</span>
            <span className="block mt-2">
              <span className="text-gradient">プロダクト</span>
              <span className="text-white">に。</span>
            </span>
          </motion.h1>

          {/* サブテキスト */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl mb-12 leading-relaxed text-white/80 max-w-2xl mx-auto"
          >
            AIでアイデアが形になる時代。
            <br className="hidden sm:block" />
            自社プロダクト開発から受託開発まで、少数精鋭のエンジニアチームが構想を現実にします。
          </motion.p>

          {/* CTAボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.button
              onClick={() => scrollToElement("services")}
              className="group relative inline-flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-gradient-brand text-white font-medium shadow-2xl shadow-brand-green/30 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">サービスを見る</span>
              <ArrowDown className="relative z-10 w-5 h-5 group-hover:translate-y-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-brand-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.button
              onClick={() => scrollToElement("contact")}
              className="group inline-flex items-center justify-center gap-3 h-14 px-8 rounded-full border-2 border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="w-5 h-5" />
              <span>お問い合わせ</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
          Scroll
        </span>
        <motion.div
          animate={prefersReducedMotion ? { y: 0 } : { y: [0, 8, 0] }}
          transition={scrollLoop}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? { y: 0, opacity: 0.4 }
                : { y: [0, 12, 0], opacity: [1, 0.3, 1] }
            }
            transition={scrollLoop}
            className="w-1 h-2 bg-white/70 rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* 装飾的な要素 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </div>
  );
}
