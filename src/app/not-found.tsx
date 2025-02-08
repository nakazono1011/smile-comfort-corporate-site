"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-support-blue-light to-white flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404テキストのアニメーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="text-[180px] font-bold text-support-blue-dark/10 select-none">
            404
          </div>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-accent absolute bottom-[40px] left-0"
          />
        </motion.div>

        {/* エラーメッセージ */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-support-blue-dark mb-4"
        >
          ページが見つかりません
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-primary/80 mb-8 leading-relaxed"
        >
          申し訳ありません。お探しのページは存在しないか、
          <br className="hidden sm:block" />
          移動または削除された可能性があります。
        </motion.p>

        {/* ホームに戻るボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/">
            <Button
              size="lg"
              className="bg-support-blue-dark hover:bg-support-blue-dark/90"
            >
              ホームに戻る
            </Button>
          </Link>
        </motion.div>

        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-support-blue-light/10 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}
