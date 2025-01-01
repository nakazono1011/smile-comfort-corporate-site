"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "ミッション", id: "mission" },
  { name: "サービス", id: "services" },
  { name: "会社概要", id: "company" },
] as const;

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
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

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center h-full">
          <motion.span
            className="text-2xl font-bold text-support-blue-dark italic tracking-wider"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Smile Comfort
          </motion.span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center space-x-8 h-full">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-primary/80 hover:text-support-blue-dark transition-colors h-full flex items-center px-4 font-medium"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {item.name}
            </motion.button>
          ))}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-md"
            >
              お問い合わせ
            </Button>
          </motion.div>
        </nav>

        {/* ハンバーガーメニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-support-blue-dark" />
          ) : (
            <Menu className="h-6 w-6 text-support-blue-dark" />
          )}
        </Button>
      </div>

      {/* モバイルナビゲーション */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col space-y-4"
              >
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-primary/80 hover:text-support-blue-dark transition-colors py-2 text-left font-medium"
                    whileHover={{ x: 4 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <Button
                  onClick={() => scrollToSection("contact")}
                  className="bg-accent hover:bg-accent/90 text-white w-full py-2 rounded-md"
                >
                  お問い合わせ
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
