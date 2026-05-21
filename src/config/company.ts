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

/**
 * 会社の能力 (Capabilities)。記事の generator が「自社ができること」を文脈に織り込む際に参照。
 * 広告ではなく実績ベースの言及として使う。
 */
export type CapabilityKey =
  | "data-platform"
  | "scraping"
  | "ec-ops"
  | "ai-contract";

export interface CapabilityInfo {
  key: CapabilityKey;
  label: { ja: string; en: string };
  blurb: { ja: string; en: string };
}

const CAPABILITIES: Record<CapabilityKey, CapabilityInfo> = {
  "data-platform": {
    key: "data-platform",
    label: { ja: "データ分析基盤構築", en: "Data analytics platforms" },
    blurb: {
      ja: "BigQuery / Snowflake / dbt を用いたデータ基盤の設計・実装・運用。",
      en: "Designing and operating data platforms on BigQuery, Snowflake, and dbt.",
    },
  },
  scraping: {
    key: "scraping",
    label: { ja: "スクレイピング開発", en: "Web scraping engineering" },
    blurb: {
      ja: "Bright Data 等を用いた大規模スクレイピング基盤の構築・運用。",
      en: "Large-scale scraping infrastructure built on Bright Data and related tools.",
    },
  },
  "ec-ops": {
    key: "ec-ops",
    label: { ja: "EC 運用支援", en: "E-commerce operations" },
    blurb: {
      ja: "Next Engine 等のツール導入から運用フロー設計、API カスタマイズまで。",
      en: "Tool deployment, workflow design, and API customization for Japanese e-commerce stacks.",
    },
  },
  "ai-contract": {
    key: "ai-contract",
    label: { ja: "AI 受託開発", en: "AI / LLM contract development" },
    blurb: {
      ja: "LLM 応用・分類タグ補完・自動化エージェントの受託開発。",
      en: "Custom LLM applications, classification and tagging, and automation agents.",
    },
  },
};

/**
 * 自社プロダクト。記事内では「広告」ではなく「弊社運用事例」として控えめに言及する。
 * 関連性が薄い記事には登場させない。
 */
export type OwnProductKey = "trabell" | "catamap";

export interface OwnProductInfo {
  key: OwnProductKey;
  name: string;
  url: string;
  tagline: { ja: string; en: string };
  blurb: { ja: string; en: string };
  /** どのアフィリエイト製品の記事で言及するのが自然か */
  relatedAffiliateProducts: Array<"brightdata" | "nextengine" | "1password">;
  /** 関連する Capability */
  capabilities: CapabilityKey[];
}

export const OWN_PRODUCTS: Record<OwnProductKey, OwnProductInfo> = {
  trabell: {
    key: "trabell",
    name: "Tra-bell",
    url: EXTERNAL_LINKS.traBell,
    tagline: {
      ja: "スクレイピング技術で築いたホテル価格追跡サービス",
      en: "Hotel price tracking service powered by our scraping pipeline",
    },
    blurb: {
      ja: "弊社が自社で運用しているホテル価格追跡プロダクト。Bright Data を用いたスクレイピング基盤の上で動いている。",
      en: "Our in-house hotel price tracking product, running on top of a Bright Data scraping pipeline.",
    },
    relatedAffiliateProducts: ["brightdata"],
    capabilities: ["scraping", "data-platform"],
  },
  catamap: {
    key: "catamap",
    name: "CataMap",
    url: EXTERNAL_LINKS.catamap,
    tagline: {
      ja: "楽天・Yahoo! の商品属性・カテゴリを AI で自動マッピング",
      en: "AI-driven category and attribute mapping for Rakuten and Yahoo! marketplaces",
    },
    blurb: {
      ja: "EC 運用支援の知見から生まれた、楽天市場 / Yahoo! ショッピングの商品属性・カテゴリマッピングを AI で補完する SaaS。",
      en: "An EC-ops-born SaaS that uses AI to fill in product attributes and category mappings for Rakuten and Yahoo! Shopping.",
    },
    relatedAffiliateProducts: ["nextengine"],
    capabilities: ["ai-contract", "ec-ops"],
  },
};
