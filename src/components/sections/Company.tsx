"use client";

import { motion } from "framer-motion";
import { COMPANY_INFO } from "@/config/company";
import { fadeInUp, staggerChildren } from "@/config/animations";

export function CompanySection() {
  return (
    <section id="company" className="py-16 bg-white">
      <div className="container mx-auto px-6">
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
          {[
            { label: "社名", value: COMPANY_INFO.name },
            { label: "法人番号", value: COMPANY_INFO.corporateNumber },
            { label: "代表者", value: COMPANY_INFO.representative },
            { label: "所在地", value: COMPANY_INFO.address.full },
            { label: "設立", value: COMPANY_INFO.establishedDate },
          ].map(({ label, value }, index) => (
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
      </div>
    </section>
  );
}
