import { getResend } from "@/lib/resend";
import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT_TOPICS } from "@/components/lp/content";

const schema = z.object({
  topics: z.array(z.enum(CONTACT_TOPICS)).default([]),
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(1),
  turnstileToken: z.string().min(1),
});

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstile(token: string, remoteip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return false;
  }

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (remoteip) formData.append("remoteip", remoteip);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      console.warn("Turnstile verification failed:", data["error-codes"]);
    }
    return data.success;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

type ContactInput = z.infer<typeof schema>;

/** 本文が JSON でない、または項目が想定外なら null (呼び出し側で 400 を返す) */
async function parseInput(request: Request): Promise<ContactInput | null> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  return parsed.success ? parsed.data : null;
}

/** Cloudflare 経由なら cf-connecting-ip、それ以外は x-forwarded-for の先頭 */
function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("cf-connecting-ip") ?? forwarded ?? null;
}

function mailText({ topics, name, email, company, message }: ContactInput) {
  return `
お問い合わせがありました。

■ お名前
${name}

■ メールアドレス
${email}

■ 会社名
${company || "記入なし"}

■ 相談したい業務
${topics.length > 0 ? topics.join("、") : "選択なし"}

■ お問い合わせ内容
${message}

※ このメールは自動送信されています。
  `.trim();
}

const errorResponse = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  const input = await parseInput(request);
  if (!input) return errorResponse("入力内容を確認してください", 400);

  try {
    const isHuman = await verifyTurnstile(input.turnstileToken, clientIp(request));
    if (!isHuman) return errorResponse("ボット検証に失敗しました。再度お試しください。", 403);

    const result = await getResend().emails.send({
      from: "お問い合わせフォーム <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL || "your-email@example.com"],
      subject: `[お問い合わせ] ${input.name}様より`,
      text: mailText(input),
    });

    if (result.error) {
      console.error("Resend API Error:", result.error);
      return errorResponse("メール送信に失敗しました", 400);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
