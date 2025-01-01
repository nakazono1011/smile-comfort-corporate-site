"use client";

import { motion } from "framer-motion";
import { Clock, Zap, Users, Smile } from "lucide-react";
import { fadeInUp, staggerChildren } from "@/config/animations";

const values = [
  {
    icon: Zap,
    title: "イノベーション",
    description:
      "常に最新のテクノロジーへの関心を持ち、より高度な価値を追い求める姿勢を持つ",
  },
  {
    icon: Users,
    title: "信頼性",
    description:
      "顧客や仲間との誠実なコミュニケーション、納期や品質へ強くこだわる",
  },
  {
    icon: Clock,
    title: "多様性の尊重",
    description: "多様な価値観を尊重し、相互理解・共和を大事にする",
  },
  {
    icon: Smile,
    title: "楽しく",
    description: "まずは自分が楽しむ、楽しく成長する",
  },
] as const;

export function ValuesSection() {
  return (
    <section id="values" className="py-24 bg-support-blue-light">
      <div className="container mx-auto px-6">
        <motion.h2
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-4xl font-bold mb-12 text-center text-support-blue-dark"
        >
          Our Values
        </motion.h2>
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {values.map((value, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <value.icon className="text-accent mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2 text-support-blue-dark">
                {value.title}
              </h3>
              <p className="text-primary/80 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
