import { resend } from "@/lib/resend";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message, turnstileToken } = schema.parse(body);

    const remoteip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;

    const isHuman = await verifyTurnstile(turnstileToken, remoteip);
    if (!isHuman) {
      return NextResponse.json(
        { error: "ボット検証に失敗しました。再度お試しください。" },
        { status: 403 }
      );
    }

    const result = await resend.emails.send({
      from: "お問い合わせフォーム <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL || "your-email@example.com"],
      subject: `[お問い合わせ] ${name}様より`,
      text: `
お問い合わせがありました。

■ お名前
${name}

■ メールアドレス
${email}

■ 会社名
${company || "記入なし"}

■ お問い合わせ内容
${message}

※ このメールは自動送信されています。
      `.trim(),
    });

    if (!result || result.error) {
      console.error("Resend API Error:", result?.error);
      return NextResponse.json(
        { error: "メール送信に失敗しました" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
