import type { AffiliateProduct } from "@/lib/mdx";

export interface AffiliateConfig {
  product: AffiliateProduct;
  brand: { ja: string; en: string };
  url: string;
  primaryCta: { ja: string; en: string };
  description: { ja: string; en: string };
  supportPitch?: { ja: string; en: string };
  supportCta?: { ja: string; en: string };
  supportUrl?: string;
}

const CONTACT_URL = "/#contact";

export const AFFILIATE: Record<AffiliateProduct, AffiliateConfig> = {
  brightdata: {
    product: "brightdata",
    brand: { ja: "Bright Data", en: "Bright Data" },
    url: "https://get.brightdata.com/0cqcj8xp08fo",
    primaryCta: {
      ja: "Bright Data を無料で試す",
      en: "Try Bright Data for free",
    },
    description: {
      ja: "世界最大級のプロキシ・データ収集プラットフォーム。Residential / Datacenter / Web Unlocker / SERP API を一括管理。",
      en: "World-class proxy and data collection platform. Manage Residential, Datacenter, Web Unlocker, and SERP API in one place.",
    },
    supportPitch: {
      ja: "弊社はスクレイピング基盤の構築・運用が本業の 1 つで、自社プロダクト Tra-bell でも Bright Data を活用しています。要件定義・PoC・本番運用・コスト最適化までご相談いただけます。",
      en: "Scraping infrastructure is a core practice for us — our own product Tra-bell runs on Bright Data. We help with requirements, PoC, production rollout, and cost optimization.",
    },
    supportCta: {
      ja: "スクレイピング基盤を相談する",
      en: "Talk to us about scraping infrastructure",
    },
    supportUrl: CONTACT_URL,
  },
  nextengine: {
    product: "nextengine",
    brand: { ja: "Next Engine", en: "Next Engine" },
    url: "https://base.next-engine.org/account/?agent_code=MzEzNw",
    primaryCta: {
      ja: "Next Engine を無料で試す",
      en: "Try Next Engine for free",
    },
    description: {
      ja: "EC 一元管理 SaaS の定番。Amazon・楽天・Yahoo!・Shopify など複数モールの受注・在庫・出荷を 1 画面で運用。",
      en: "The leading OMS for Japanese marketplaces. Unify orders, inventory, and shipping across Amazon, Rakuten, Yahoo!, and Shopify.",
    },
    supportPitch: {
      ja: "弊社は Next Engine の導入実績に加え、楽天・Yahoo! の商品マッピングを AI で補完する自社プロダクト CataMap も運用しています。初期設定からモール連携・データ整備までまとめてご相談ください。",
      en: "We deploy Next Engine for clients and also operate CataMap, our own AI product that fills in Rakuten/Yahoo! category mappings. We help with setup, marketplace integration, and product data cleanup.",
    },
    supportCta: {
      ja: "導入支援を相談する",
      en: "Talk to our integration team",
    },
    supportUrl: CONTACT_URL,
  },
  "1password": {
    product: "1password",
    brand: { ja: "1Password", en: "1Password" },
    url: "https://1password.partnerlinks.io/sc-link",
    primaryCta: {
      ja: "1Password を試す",
      en: "Try 1Password",
    },
    description: {
      ja: "個人・チーム双方で導入が進む業界標準のパスワードマネージャー。SSO・ゼロトラスト時代の認証情報管理に。",
      en: "The industry-standard password manager for individuals and teams. Built for SSO and zero-trust authentication.",
    },
  },
};

/**
 * アフィリエイトリンクのホスト一覧（`AFFILIATE[].url` から導出）。
 * MDX 本文中のインラインリンクに rel="sponsored nofollow" を自動付与する判定に使う。
 * 1Password は Business / 乗り換え用の派生リンクも同一ホスト (1password.partnerlinks.io) を共有するため、
 * ホスト単位の判定で全バリアントを網羅できる。
 */
export const AFFILIATE_LINK_HOSTS: readonly string[] = Array.from(
  new Set(Object.values(AFFILIATE).map((cfg) => new URL(cfg.url).host)),
);

/** href が計測・rel 付与対象のアフィリエイトリンクか判定する */
export function isAffiliateUrl(href: string): boolean {
  try {
    return AFFILIATE_LINK_HOSTS.includes(new URL(href).host);
  } catch {
    return false;
  }
}
