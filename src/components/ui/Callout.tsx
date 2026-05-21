import type { ReactNode } from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";

type CalloutType = "tip" | "info" | "warning" | "danger";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const STYLES: Record<
  CalloutType,
  { bg: string; border: string; text: string; iconColor: string }
> = {
  tip: {
    bg: "bg-brand-green/5",
    border: "border-brand-green/30",
    text: "text-brand-deep",
    iconColor: "text-brand-green",
  },
  info: {
    bg: "bg-support-blue-light/40",
    border: "border-support-blue-light",
    text: "text-brand-deep",
    iconColor: "text-brand-blue",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    iconColor: "text-amber-500",
  },
  danger: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-900",
    iconColor: "text-rose-500",
  },
};

const ICONS: Record<CalloutType, typeof Info> = {
  tip: Lightbulb,
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const s = STYLES[type];
  const Icon = ICONS[type];

  return (
    <aside
      className={[
        "not-prose my-8 flex gap-4 rounded-2xl border p-5",
        s.bg,
        s.border,
        s.text,
      ].join(" ")}
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${s.iconColor}`} />
      <div className="min-w-0 flex-1">
        {title ? <div className="mb-1 font-semibold">{title}</div> : null}
        <div className="text-[15px] leading-relaxed">{children}</div>
      </div>
    </aside>
  );
}
