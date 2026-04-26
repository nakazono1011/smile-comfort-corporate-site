"use client";

import { motion, useReducedMotion } from "framer-motion";
import { COMPANY_INFO, EXTERNAL_LINKS } from "@/config/company";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navigation = [
  { name: "サービス", href: "#services" },
  { name: "プロダクト", href: "#products" },
  { name: "会社概要", href: "#company" },
  { name: "お問い合わせ", href: "#contact" },
] as const;

const serviceLinks = [
  { name: "AI開発", href: "#services" },
  { name: "EC構築・運営支援", href: "#services" },
] as const;

export function SiteFooter() {
  const prefersReducedMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-brand-deep text-white overflow-hidden">
      {/* 装飾的な背景 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* ロゴと会社情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-4 space-y-6"
          >
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="Smile Comfort"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-display font-bold text-xl text-white group-hover:text-brand-green transition-colors">
                Smile Comfort
              </span>
            </Link>
            <p className="text-white/60 leading-relaxed max-w-sm">
              AI開発・EC支援で、中小企業のDXを加速する技術パートナー。
            </p>
            <p className="text-white/40 text-sm">{COMPANY_INFO.name}</p>
          </motion.div>

          {/* ナビゲーション */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-3 space-y-6"
          >
            <h3 className="font-display font-bold text-white">Navigation</h3>
            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group flex items-center gap-2 text-white/60 hover:text-brand-green transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green/50 group-hover:bg-brand-green transition-colors" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* サービス・リンク */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-3 space-y-6"
          >
            <h3 className="font-display font-bold text-white">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group flex items-center gap-2 text-white/60 hover:text-brand-green transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan/50 group-hover:bg-brand-cyan transition-colors" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* リンク */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <h3 className="font-display font-bold text-white">Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/media"
                  className="group flex items-center gap-2 text-white/60 hover:text-brand-green transition-colors"
                >
                  メディア
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <a
                  href={EXTERNAL_LINKS.note}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-white/60 hover:text-brand-green transition-colors"
                >
                  note
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>

            {/* トップに戻るボタン */}
            <motion.button
              onClick={scrollToTop}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-brand-green/50 hover:bg-brand-green/10 transition-all duration-300"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <span>トップに戻る</span>
              <motion.span
                animate={prefersReducedMotion ? { y: 0 } : { y: [0, -3, 0] }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }
              >
                ↑
              </motion.span>
            </motion.button>
          </motion.div>
        </div>

        {/* 区切り線 */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="my-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* コピーライト */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
