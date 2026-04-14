export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://smilecomfort.jp";

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

export const ANALYTICS = {
  gaId: "G-8HRNH9FQ9G",
  gtmId: "GTM-KCSG3QM2",
} as const;
