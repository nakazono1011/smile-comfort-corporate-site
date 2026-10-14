"use client";

import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { cn } from "@/lib/utils";
import { CONTACT_TOPICS, type ContactTopic } from "../content";

const schema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("メールアドレスの形式を確認してください"),
  company: z.string().optional(),
  message: z.string().min(1, "ご相談内容を入力してください"),
});

type FormValues = z.infer<typeof schema>;
type Status = "idle" | "success" | "error" | "captcha";

const CONSULT_EXAMPLES = [
  "楽天市場と自社ECの在庫ずれをなくしたい",
  "海外モールに出品したいが、翻訳の手が足りない",
  "似た問い合わせへの返信に、毎日追われている",
] as const;

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const d = (n: number) => ({ "--d": n }) as CSSProperties;

const fieldClass =
  "peer mt-2 block w-full border-0 border-b border-sc-fg/25 bg-transparent px-0 py-3 text-base text-sc-fg placeholder:text-sc-fg/30 transition-colors focus:border-sc-signal focus:outline-none focus:ring-0 aria-[invalid=true]:border-[#F08A74]";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm text-[#F4A08E]">
      {message}
    </p>
  );
}

/** 入力欄ごとのエラー文 (なければ undefined) */
const errorMessages = (errors: FieldErrors<FormValues>) => ({
  name: errors.name?.message,
  email: errors.email?.message,
  message: errors.message?.message,
});

/** 入力欄が不正なとき、読み上げソフト向けにエラー文と結び付ける */
const invalidProps = (id: string, error?: string) => ({
  "aria-invalid": Boolean(error),
  "aria-describedby": error ? `${id}-error` : undefined,
});

function Field({
  id,
  label,
  required = false,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-bold">
        {label} {required && <span className="text-sc-accent">*</span>}
      </label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function TopicPicker({ topics, onToggle }: { topics: ContactTopic[]; onToggle: (t: ContactTopic) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">
        相談したい業務 <span className="font-normal text-sc-fg/60">（複数選択できます）</span>
      </legend>
      <div className="mt-4 flex flex-wrap gap-2">
        {CONTACT_TOPICS.map((t) => (
          <label key={t} className="cursor-pointer">
            <input
              type="checkbox"
              value={t}
              checked={topics.includes(t)}
              onChange={() => onToggle(t)}
              className="peer sr-only"
            />
            <span className="flex items-center gap-2 rounded-[2px] px-4 py-2.5 text-sm font-bold text-sc-fg/75 shadow-[inset_0_0_0_1px_rgb(var(--c-fg)/0.25)] transition-colors duration-300 hover:text-sc-fg peer-checked:bg-sc-signal peer-checked:text-[#081410] peer-checked:shadow-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sc-signal">
              {t}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SubmitButton({ submitting, disabled }: { submitting: boolean; disabled: boolean }) {
  const Icon = submitting ? Loader2 : ArrowRight;
  return (
    <button
      type="submit"
      disabled={disabled}
      className="sc-btn w-full justify-between disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[18rem]"
    >
      <span className="sc-btn-label">{submitting ? "送信しています" : "この内容で送信する"}</span>
      <span className="sc-btn-icon">
        <Icon className={cn("h-4 w-4", submitting && "animate-spin")} aria-hidden />
      </span>
    </button>
  );
}

const STATUS_MESSAGES: Record<Status, { text: string; className: string } | null> = {
  idle: null,
  success: { text: "送信しました。内容を確認のうえ、担当者からご連絡します。", className: "text-sc-accent" },
  error: { text: "送信できませんでした。時間をおいて、もう一度お試しください。", className: "text-[#F4A08E]" },
  captcha: { text: "送信前に、ロボットでないことの確認を完了してください。", className: "text-[#F4C38E]" },
};

function StatusMessage({ status }: { status: Status }) {
  const m = STATUS_MESSAGES[status];
  return (
    <p aria-live="polite" className="text-sm leading-relaxed">
      {m && <span className={m.className}>{m.text}</span>}
    </p>
  );
}

async function postContact(payload: Record<string, unknown>) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("送信に失敗しました");
}

/** フォームの状態と送信処理。ロボット確認 (Turnstile) のトークンがないと送らない */
function useContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [topics, setTopics] = useState<ContactTopic[]>([]);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const toggleTopic = (t: ContactTopic) =>
    setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      setStatus("captcha");
      return;
    }
    setSubmitting(true);
    try {
      await postContact({ ...values, topics, turnstileToken: token });
      setStatus("success");
      form.reset();
      setTopics([]);
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
      setToken(null);
      turnstileRef.current?.reset();
    }
  };

  const onVerified = (t: string) => {
    setToken(t);
    if (status === "captcha") setStatus("idle");
  };

  return {
    form,
    status,
    submitting,
    topics,
    toggleTopic,
    turnstileRef,
    onVerified,
    clearToken: () => setToken(null),
    submit: form.handleSubmit(onSubmit),
    disabled: submitting || (Boolean(turnstileSiteKey) && !token),
  };
}

function CaptchaField({
  turnstileRef,
  onVerified,
  onClear,
}: {
  turnstileRef: RefObject<TurnstileInstance | null>;
  onVerified: (token: string) => void;
  onClear: () => void;
}) {
  if (!turnstileSiteKey) return null;
  return (
    <div className="mt-10">
      <Turnstile
        ref={turnstileRef}
        siteKey={turnstileSiteKey}
        options={{ theme: "dark", language: "ja" }}
        onSuccess={onVerified}
        onError={onClear}
        onExpire={onClear}
      />
    </div>
  );
}

export function Contact() {
  const c = useContactForm();
  const { register } = c.form;
  const errors = errorMessages(c.form.formState.errors);

  return (
    <section
      id="contact"
      data-section-theme="dark"
      aria-labelledby="contact-title"
      className="relative py-28 sm:py-36 lg:py-44"
    >
      <div className="sc-wrap grid gap-14 lg:grid-cols-12 lg:gap-y-20">
        <div className="lg:col-span-12">
          <p data-reveal className="t-kicker text-sc-fg/60">
            Contact
          </p>
          <h2 id="contact-title" data-reveal className="t-h2 mt-6" style={d(0.05)}>
            まずは、今の業務を
            <br />
            聞かせてください。
          </h2>
        </div>
        <div className="lg:col-span-4">
          <p data-reveal className="max-w-[26em] text-[15px] leading-[1.95] text-sc-fg/70 sm:text-base" style={d(0.1)}>
            何から頼めばいいか決まっていなくても大丈夫です。内容を確認のうえ、担当者からメールでご連絡します。
          </p>
          <div data-reveal style={d(0.15)} className="mt-12 hidden lg:block">
            <p className="text-xs font-bold text-sc-fg/60">たとえば、こんなご相談から</p>
            <ul className="mt-4 border-t border-sc-fg/15">
              {CONSULT_EXAMPLES.map((e) => (
                <li key={e} className="border-b border-sc-fg/15 py-4 text-[15px] leading-relaxed text-sc-fg/80">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={c.submit} noValidate data-reveal style={d(0.1)} className="lg:col-span-7 lg:col-start-6">
          <TopicPicker topics={c.topics} onToggle={c.toggleTopic} />

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <Field id="contact-name" label="お名前" required error={errors.name}>
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                placeholder="山田 太郎"
                {...invalidProps("contact-name", errors.name)}
                {...register("name")}
                className={fieldClass}
              />
            </Field>
            <Field id="contact-company" label="会社名・ショップ名">
              <input
                id="contact-company"
                type="text"
                autoComplete="organization"
                placeholder="株式会社〇〇"
                {...register("company")}
                className={fieldClass}
              />
            </Field>
            <Field id="contact-email" label="メールアドレス" required error={errors.email} className="sm:col-span-2">
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...invalidProps("contact-email", errors.email)}
                {...register("email")}
                className={fieldClass}
              />
            </Field>
            <Field id="contact-message" label="ご相談内容" required error={errors.message} className="sm:col-span-2">
              <textarea
                id="contact-message"
                rows={5}
                placeholder="例: 楽天市場と自社ECの在庫を合わせる作業に、毎日2時間ほどかかっています。"
                {...invalidProps("contact-message", errors.message)}
                {...register("message")}
                className={cn(fieldClass, "resize-none leading-[1.9]")}
                data-lenis-prevent
              />
            </Field>
          </div>

          <CaptchaField turnstileRef={c.turnstileRef} onVerified={c.onVerified} onClear={c.clearToken} />

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
            <SubmitButton submitting={c.submitting} disabled={c.disabled} />
            <StatusMessage status={c.status} />
          </div>
        </form>
      </div>
    </section>
  );
}
