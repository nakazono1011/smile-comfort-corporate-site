"use client";

import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { ArrowDown, Clock, Sparkles } from "lucide-react";

export function HeroContent() {
  const mouseX = useMotionValue(0);
  const x = useTransform(mouseX, [-1000, 1000], [-80, 80]);
  const springX = useSpring(x, {
    stiffness: 50,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - window.innerWidth / 2;
      mouseX.set(x);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  const scrollToMission = () => {
    const element = document.getElementById("mission");
    if (element) {
      const offset = 80;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative h-full">
      {/* パノラマ背景のコンテナ */}
      <div className="absolute inset-0 overflow-hidden">
        {/* パノラマ画像 */}
        <motion.div
          className="absolute inset-0 scale-[1.3]"
          style={{
            x: springX,
            width: "130%",
            left: "-15%",
          }}
        >
          <Image
            src="/hero.jpg"
            alt="Tokyo cityscape"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </motion.div>

        {/* グラデーションオーバーレイ - ロゴカラーに合わせた緑〜青 */}
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
      <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
        <div className="max-w-5xl">
          {/* バッジ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-brand-deep text-sm font-medium">
              <Sparkles className="w-4 h-4 text-brand-green" />
              テクノロジーで自由な時間を創造する
            </span>
          </motion.div>

          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold mb-8 leading-[1.1] tracking-tight"
          >
            <span className="block text-white">
              テクノロジーで、
            </span>
            <span className="block mt-2">
              <span className="text-gradient">自由な時間</span>
              <span className="text-white">を創造する。</span>
            </span>
          </motion.h1>

          {/* サブテキスト */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl mb-12 leading-relaxed text-white/80 max-w-2xl"
          >
            すべての人の自由な時間を増やし、
            <br className="hidden sm:block" />
            個々の能力を解き放ち、幸福を最大化する。
          </motion.p>

          {/* CTAボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.button
              onClick={scrollToMission}
              className="group relative inline-flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-gradient-brand text-white font-medium shadow-2xl shadow-brand-green/30 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">私たちについて</span>
              <ArrowDown className="relative z-10 w-5 h-5 group-hover:translate-y-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-brand-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.button
              onClick={() => {
                const element = document.getElementById("contact");
                if (element) {
                  const offset = 80;
                  const elementPosition =
                    element.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({
                    top: elementPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="group inline-flex items-center justify-center gap-3 h-14 px-8 rounded-full border-2 border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="w-5 h-5" />
              <span>お問い合わせ</span>
            </motion.button>
          </motion.div>

          {/* 統計情報 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                { label: "業務効率化", value: "最大80%", suffix: "削減" },
                { label: "導入実績", value: "多数", suffix: "の企業様" },
                { label: "技術領域", value: "フルスタック", suffix: "対応" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="text-center sm:text-left"
                >
                  <div className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {stat.value}
                    <span className="text-brand-green text-lg ml-1">{stat.suffix}</span>
                  </div>
                  <div className="text-white/60 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
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
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 bg-white/70 rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* 装飾的な要素 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </div>
  );
}
