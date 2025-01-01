import { resend } from "@/lib/resend";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message } = schema.parse(body);

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
