"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerChildren } from "@/config/animations";

interface CompanyContentProps {
  data: Array<{ label: string; value: string }>;
}

export function CompanyContent({ data }: CompanyContentProps) {
  return (
    <>
      <motion.h2
        {...fadeInUp}
        className="text-4xl font-bold mb-12 text-center text-support-blue-dark"
      >
        会社概要
      </motion.h2>
      <motion.div
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        {data.map(({ label, value }, index) => (
          <motion.div
            key={label}
            variants={fadeInUp}
            className={`flex py-4 ${
              index !== 0 ? "border-t border-gray-200" : ""
            }`}
          >
            <div className="w-32 font-bold text-primary">{label}</div>
            <div className="flex-1 text-support-gray">{value}</div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
