"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "ミッション", id: "mission" },
  { name: "サービス", id: "services" },
  { name: "会社概要", id: "company" },
] as const;

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // ホームページ用のナビゲーションアイテム
  const HomeNavItems = () => (
    <>
      <Link
        href="/media"
        className="relative text-sm font-medium text-brand-deep/70 hover:text-brand-teal transition-colors group"
      >
        メディア
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-brand group-hover:w-full transition-all duration-300" />
      </Link>
      {menuItems.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => handleScrollTo(item.id)}
          className="relative text-sm font-medium text-brand-deep/70 hover:text-brand-teal transition-colors group"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          {item.name}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-brand group-hover:w-full transition-all duration-300" />
        </motion.button>
      ))}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => handleScrollTo("contact")}
          className="relative overflow-hidden bg-gradient-brand text-white px-6 py-2.5 rounded-full font-medium shadow-lg shadow-brand-green/20 hover:shadow-xl hover:shadow-brand-teal/30 transition-all duration-300 group"
        >
          <span className="relative z-10 flex items-center gap-2">
            お問い合わせ
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-brand-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </motion.div>
    </>
  );

  // メディアページ用のナビゲーションアイテム
  const MediaNavItems = () => (
    <>
      <Link
        href="/"
        className="relative text-sm font-medium text-brand-deep/70 hover:text-brand-teal transition-colors group"
      >
        ホームに戻る
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-brand group-hover:w-full transition-all duration-300" />
      </Link>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href="/#contact">
          <Button className="relative overflow-hidden bg-gradient-brand text-white px-6 py-2.5 rounded-full font-medium shadow-lg shadow-brand-green/20 hover:shadow-xl hover:shadow-brand-teal/30 transition-all duration-300 group">
            <span className="relative z-10 flex items-center gap-2">
              お問い合わせ
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-brand-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </Link>
      </motion.div>
    </>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass shadow-lg shadow-brand-green/5 border-b border-brand-green/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center h-full py-4">
          <motion.div
            className="relative h-12 w-12"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Image
              src="/logo.png"
              alt="Smile Comfort"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
          <motion.span 
            className={`ml-3 font-display font-bold text-lg tracking-tight transition-colors duration-300 ${
              isScrolled ? "text-brand-deep" : "text-white"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Smile Comfort
          </motion.span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {isHomePage ? <HomeNavItems /> : <MediaNavItems />}
        </nav>

        {/* ハンバーガーメニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className={`md:hidden rounded-full ${
            isScrolled ? "text-brand-deep" : "text-white"
          } hover:bg-brand-green/10`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.div>
        </Button>
      </div>

      {/* モバイルナビゲーション */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden glass border-t border-brand-green/10 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col space-y-4"
              >
                {isHomePage ? (
                  <>
                    <Link
                      href="/media"
                      className="text-brand-deep/70 hover:text-brand-teal transition-colors py-2 font-medium"
                    >
                      メディア
                    </Link>
                    {menuItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => handleScrollTo(item.id)}
                        className="text-brand-deep/70 hover:text-brand-teal transition-colors py-2 text-left font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                      >
                        {item.name}
                      </motion.button>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={() => handleScrollTo("contact")}
                        className="w-full bg-gradient-brand text-white py-3 rounded-full font-medium shadow-lg shadow-brand-green/20"
                      >
                        <span className="flex items-center justify-center gap-2">
                          お問い合わせ
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/"
                      className="text-brand-deep/70 hover:text-brand-teal transition-colors py-2 font-medium"
                    >
                      ホームに戻る
                    </Link>
                    <Link href="/#contact">
                      <Button className="w-full bg-gradient-brand text-white py-3 rounded-full font-medium shadow-lg shadow-brand-green/20">
                        <span className="flex items-center justify-center gap-2">
                          お問い合わせ
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
