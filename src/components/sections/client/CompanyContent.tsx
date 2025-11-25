"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Hash, User, MapPin, Calendar } from "lucide-react";

interface CompanyContentProps {
  data: Array<{ label: string; value: string }>;
}

const iconMap: Record<string, typeof Building2> = {
  "社名": Building2,
  "法人番号": Hash,
  "代表者": User,
  "所在地": MapPin,
  "設立": Calendar,
};

export function CompanyContent({ data }: CompanyContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref}>
      {/* セクションヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-cyan/10 text-brand-cyan text-sm font-medium mb-6">
          About Us
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-deep mb-6">
          会社概要
        </h2>
        <div className="w-20 h-1 bg-gradient-brand mx-auto rounded-full" />
      </motion.div>

      {/* 会社情報カード */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl shadow-brand-green/10 border border-brand-green/10">
          {/* 背景装飾 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* コンテンツ */}
          <div className="relative divide-y divide-brand-green/10">
            {data.map(({ label, value }, index) => {
              const Icon = iconMap[label] || Building2;
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex flex-col sm:flex-row py-6 px-8 hover:bg-brand-green/5 transition-colors duration-300 group"
                >
                  <div className="w-full sm:w-48 font-bold text-brand-deep mb-3 sm:mb-0 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-brand group-hover:shadow-lg transition-shadow duration-300">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {label}
                  </div>
                  <div className="flex-1 text-brand-deep/70 leading-relaxed sm:flex sm:items-center">
                    {value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
