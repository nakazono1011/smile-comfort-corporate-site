"use client";

import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const x = useTransform(mouseX, [-1000, 1000], [-100, 100]);
  const springX = useSpring(x, {
    stiffness: 50,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX } = e;
      const { left, width } = containerRef.current?.getBoundingClientRect() ?? {
        left: 0,
        width: 0,
      };
      const x = clientX - left - width / 2;
      mouseX.set(x);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  return (
    <section
      ref={containerRef}
      className="relative h-[600px] overflow-hidden sm:h-[800px] md:h-[1000px] lg:h-[1200px]"
    >
      {/* パノラマ背景のコンテナ */}
      <div className="absolute inset-0 overflow-hidden">
        {/* パノラマ画像 */}
        <motion.div
          className="absolute inset-0 scale-[1.5]"
          style={{
            x: springX,
            width: "150%",
            left: "-25%",
          }}
        >
          <Image
            src="/hero.jpg"
            alt="Tokyo cityscape"
            fill
            className="object-cover brightness-95"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/30" />
        </motion.div>
      </div>

      {/* オーバーレイグラデーション */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-black/10" />

      {/* コンテンツ */}
      <div className="relative z-[2] container mx-auto px-6 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl text-white"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-relaxed"
          >
            テクノロジーで、
            <br />
            自由な時間を創造する。
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed text-gray-200"
          >
            すべての人の自由な時間を増やし、
            <br />
            個々の能力を解き放ち、幸福を最大化する。
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
