export interface AuthorProfile {
  id: string;
  name: { ja: string; en: string };
  role: { ja: string; en: string };
  bio: { ja: string; en: string };
  avatar?: string;
  url?: string;
}

const AUTHORS: Record<string, AuthorProfile> = {
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

const DEFAULT_AUTHOR_ID = "smile-comfort";

export function getAuthor(id?: string): AuthorProfile {
  return AUTHORS[id ?? ""] ?? AUTHORS[DEFAULT_AUTHOR_ID];
}
