export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.smile-comfort.com";

export const COMPANY_INFO = {
  name: "合同会社スマイルコンフォート",
  nameKana: "スマイルコンフォート",
  nameEn: "Smile Comfort LLC",
  corporateNumber: "9020003027311",
  address: {
    full: "東京都目黒区下目黒１丁目１番１４号 コノトラビル７Ｆ",
    postalCode: "153-0064",
  },
  representative: "中園 啓佑",
  tel: "080-5217-0560",
  establishedDate: "2024年11月22日",
} as const;

/** GA4 は GTM コンテナ内で計測（重複ロードを避け GTM のみ使用） */
export const ANALYTICS = {
  gtmId: "GTM-KCSG3QM2",
} as const;

/** OGP / Twitter Cards で共通利用するデフォルト画像 */
export const OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "合同会社スマイルコンフォート",
} as const;

/** 外部 URL（自社プロダクト・SNS）。JSON-LD sameAs / リンク群で共通参照 */
export const EXTERNAL_LINKS = {
  catamap: "https://catamap.app/",
  traBell: "https://www.tra-bell.com",
  note: "https://note.com/smilecomfort",
} as const;
