"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/config/animations";

export function MissionSection() {
  return (
    <section id="mission" className="py-24 bg-support-blue-light">
      <div className="container mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold text-support-blue-dark"
          >
            ミッション
          </motion.h2>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.p
            variants={fadeInUp}
            className="text-xl text-primary/80 leading-relaxed"
          >
            私たちは、最先端テクノロジーを駆使し、お客様のビジネスプロセスと意思決定の高度化のサポートを提供いたします。
            確かな技術力と豊富な経験を活かし、お客様と共に歩み成長しながら、予測不可能な時代を切り開くパートナーとして、お客様の成功に貢献してまいります。
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
