"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/config/animations";
import { COMPANY_INFO } from "@/config/company";

const navigation = [
  { name: "ミッション", href: "#mission" },
  { name: "サービス", href: "#services" },
  { name: "会社概要", href: "#company" },
  { name: "お問い合わせ", href: "#contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-support-blue-dark text-white py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {/* 会社情報 */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="font-bold text-xl">{COMPANY_INFO.name}</h3>
          </motion.div>

          {/* ナビゲーション */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* コピーライト */}
        <motion.div
          variants={fadeInUp}
          className="text-center mt-12 pt-8 border-t border-gray-700"
        >
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
