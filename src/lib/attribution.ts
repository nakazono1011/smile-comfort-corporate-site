import { z } from "zod";

const MAX_LENGTH = 200;
const text = z.string().max(MAX_LENGTH).optional();

export const attributionSchema = z.object({
  source: text,
  medium: text,
  campaign: text,
  content: text,
  landing: text,
});

export type Attribution = z.infer<typeof attributionSchema>;

const STORAGE_KEY = "sc_attribution";

const UTM_FIELDS = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_content: "content",
} as const;

/** 流入元の記録が無いとき undefined。ストレージが使えなくても投げない */
export function readAttribution(): Attribution | undefined {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = attributionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/** UTM 付きで着地したとき、セッションで最初の 1 回だけ保存する (first touch) */
export function captureAttribution(url: URL): void {
  const found: Attribution = {};
  for (const [param, field] of Object.entries(UTM_FIELDS)) {
    const value = url.searchParams.get(param);
    if (value) found[field as keyof typeof found] = value.slice(0, MAX_LENGTH);
  }
  if (Object.keys(found).length === 0) return;
  if (readAttribution()) return;
  try {
    const entry: Attribution = { ...found, landing: url.pathname.slice(0, MAX_LENGTH) };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // ストレージが使えない環境では記録しない
  }
}

/** メール本文の流入元セクション。記録が無ければ「記録なし」 */
export function attributionMailSection(a?: Attribution): string {
  if (!a || Object.values(a).every((v) => !v)) return "流入元: 記録なし";
  const none = "なし";
  return `流入元: ${a.source || none} / ${a.medium || none}
マス: ${a.campaign || none}
記事ID: ${a.content || none}
最初に開いたページ: ${a.landing || none}`;
}
