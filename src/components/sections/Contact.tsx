"use client";

import { motion, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { Send, User, Mail, Building, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  company: z.string().optional(),
  message: z.string().min(1, "メッセージを入力してください"),
});

type FormData = z.infer<typeof schema>;

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("送信に失敗しました");

      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={ref} className="relative py-32 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 pattern-grid opacity-50" />
      
      {/* 装飾的な背景 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6">
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-medium mb-6">
            Contact
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-deep mb-6">
            お問い合わせ
          </h2>
          <div className="w-20 h-1 bg-gradient-brand mx-auto rounded-full" />
          <p className="mt-6 text-lg text-brand-deep/60 max-w-2xl mx-auto">
            ご質問・ご相談はお気軽にお問い合わせください
          </p>
        </motion.div>

        {/* フォームカード */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl shadow-brand-green/10 border border-brand-green/10">
            {/* 背景装飾 */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-brand opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <form onSubmit={handleSubmit(onSubmit)} className="relative p-8 md:p-12 space-y-6">
              {/* ローディングオーバーレイ */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
                    <span className="text-brand-deep/60 text-sm">送信中...</span>
                  </div>
                </div>
              )}

              {/* お名前 */}
              <div className="space-y-2">
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-brand-deep">
                  <User className="w-4 h-4 text-brand-teal" />
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-xl border border-brand-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all duration-300 placeholder:text-brand-deep/30"
                  placeholder="山田 太郎"
                />
                {errors.name && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* メールアドレス */}
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-brand-deep">
                  <Mail className="w-4 h-4 text-brand-teal" />
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-xl border border-brand-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all duration-300 placeholder:text-brand-deep/30"
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* 会社名 */}
              <div className="space-y-2">
                <label htmlFor="company" className="flex items-center gap-2 text-sm font-medium text-brand-deep">
                  <Building className="w-4 h-4 text-brand-teal" />
                  会社名
                </label>
                <input
                  {...register("company")}
                  type="text"
                  id="company"
                  className="w-full px-4 py-3 rounded-xl border border-brand-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all duration-300 placeholder:text-brand-deep/30"
                  placeholder="株式会社〇〇"
                />
              </div>

              {/* メッセージ */}
              <div className="space-y-2">
                <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-brand-deep">
                  <MessageSquare className="w-4 h-4 text-brand-teal" />
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("message")}
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-brand-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all duration-300 placeholder:text-brand-deep/30 resize-none"
                  placeholder="お問い合わせ内容をご記入ください"
                />
                {errors.message && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* 送信ボタン */}
              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden py-4 px-8 rounded-full bg-gradient-brand text-white font-medium shadow-xl shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        送信する
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-brand-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </div>

              {/* 送信結果メッセージ */}
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">お問い合わせありがとうございます</p>
                    <p className="text-sm text-green-600 mt-1">
                      内容を確認の上、担当者より連絡させていただきます。
                    </p>
                  </div>
                </motion.div>
              )}
              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">送信に失敗しました</p>
                    <p className="text-sm text-red-600 mt-1">
                      時間をおいて再度お試しいただくか、直接お電話でご連絡ください。
                    </p>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
