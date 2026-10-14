import { Resend } from "resend";

let client: Resend | null = null;

/**
 * 送信時に初めてクライアントを作る。
 * モジュール読み込み時にキーの有無を検査すると、キーを置いていないプレビュー環境では
 * 送信処理を呼ばないビルド (ページ情報の収集) の段階で落ちるため、検査は呼び出し時に行う
 */
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not defined in environment variables");
  client ??= new Resend(key);
  return client;
}
