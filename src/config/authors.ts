export interface AuthorProfile {
  id: string;
  name: { ja: string; en: string };
  role: { ja: string; en: string };
  bio: { ja: string; en: string };
  avatar?: string;
  url?: string;
}

export const AUTHORS: Record<string, AuthorProfile> = {
  "kei-nakazono": {
    id: "kei-nakazono",
    name: {
      ja: "中園 啓佑",
      en: "Kei Nakazono",
    },
    role: {
      ja: "合同会社スマイルコンフォート 代表",
      en: "CEO, Smile Comfort LLC",
    },
    bio: {
      ja: "Web 開発・データ基盤構築・EC 運用支援を専門とし、Bright Data や Next Engine の導入運用実績多数。スクレイピング基盤と一元管理ツール導入のコンサルティングを提供。",
      en: "Specializes in web development, data infrastructure, and e-commerce operations. Hands-on experience deploying Bright Data and Next Engine for clients. Provides consulting on scraping platforms and OMS tooling.",
    },
    avatar: "/logo.png",
    url: "https://www.smile-comfort.com",
  },
  "smile-comfort": {
    id: "smile-comfort",
    name: {
      ja: "スマイルコンフォート編集部",
      en: "Smile Comfort Editorial",
    },
    role: {
      ja: "メディア編集部",
      en: "Editorial Team",
    },
    bio: {
      ja: "Web 開発・EC 運営・セキュリティに関する実用情報を発信するメディア編集部。",
      en: "Editorial team publishing practical insights on web development, e-commerce, and security.",
    },
    avatar: "/logo.png",
    url: "https://www.smile-comfort.com",
  },
};

export const DEFAULT_AUTHOR_ID = "smile-comfort";

export function getAuthor(id?: string): AuthorProfile {
  return AUTHORS[id ?? ""] ?? AUTHORS[DEFAULT_AUTHOR_ID];
}
