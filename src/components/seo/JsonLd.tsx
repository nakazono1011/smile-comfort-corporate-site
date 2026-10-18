import {
  BASE_URL,
  COMPANY_INFO,
  EXTERNAL_LINKS,
  OG_IMAGE,
  OWN_PRODUCTS,
} from "@/config/company";
import type { FaqPair, PostMeta } from "@/lib/mdx";
import { CHANNELS, SERVICES } from "@/components/lp/content";

/** sameAs は「同じ会社を指す別ページ」だけを並べる。自社プロダクトのサイトは入れず、下の WebApplication で表す */
const ORG_SAME_AS = [EXTERNAL_LINKS.note] as const;

const ORG_ID = `${BASE_URL}/#organization`;

/** トップページに載せている自社プロダクト。会社 (ORG_ID) が提供するアプリケーションとして記述する */
const LP_PRODUCTS = [OWN_PRODUCTS.catamap, OWN_PRODUCTS.catamapReuse];

const mediaUrl = (slug: string, lang: "ja" | "en") =>
  lang === "en" ? `${BASE_URL}/en/media/${slug}` : `${BASE_URL}/media/${slug}`;

const absoluteUrl = (path: string) =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: COMPANY_INFO.name,
    alternateName: COMPANY_INFO.nameEn,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "自社EC・国内モール・海外モールの課題を、AIと仕組みで解決する会社。出品業務、併売、問い合わせ対応、ページ改善の効率化を、業務の棚卸しから開発・運用まで支援する。",
    knowsAbout: [
      "EC運営",
      "生成AI",
      ...SERVICES.map((s) => s.title),
      ...CHANNELS.map((c) => c.title),
      "中古相場",
      "価格リサーチ",
    ],
    areaServed: { "@type": "Country", name: "Japan" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "EC × AI の業務改善支援",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: `${s.lead}${s.body}`,
          url: `${BASE_URL}/#service-${s.key}`,
        },
      })),
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_INFO.address.full,
      postalCode: COMPANY_INFO.address.postalCode,
      addressLocality: "目黒区",
      addressRegion: "東京都",
      addressCountry: "JP",
    },
    founder: {
      "@type": "Person",
      name: COMPANY_INFO.representative,
    },
    foundingDate: "2024-11-22",
    telephone: COMPANY_INFO.tel,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: COMPANY_INFO.tel,
        contactType: "customer service",
        availableLanguage: ["ja", "en"],
      },
    ],
    sameAs: [...ORG_SAME_AS],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY_INFO.name,
    alternateName: COMPANY_INFO.nameEn,
    url: BASE_URL,
    inLanguage: "ja",
    publisher: { "@id": ORG_ID },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

/** 自社プロダクトの構造化データ。製品を載せているトップページだけで出す (全ページに出すと表示内容と合わない) */
export function ProductsJsonLd() {
  const products = LP_PRODUCTS.map((p) => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${p.url}#app`,
    name: p.name,
    url: p.url,
    description: p.tagline.ja,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "ja",
    publisher: { "@id": ORG_ID },
  }));

  return (
    <>
      {products.map((p) => (
        <script
          key={p["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(p) }}
        />
      ))}
    </>
  );
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  date: string;
  lang: "ja" | "en";
  tags?: string[];
  cover?: string;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  date,
  lang,
  tags,
  cover,
}: ArticleJsonLdProps) {
  const url = mediaUrl(slug, lang);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: date,
    dateModified: date,
    inLanguage: lang === "en" ? "en-US" : "ja-JP",
    image: absoluteUrl(cover ?? OG_IMAGE.url),
    keywords: tags?.join(", "),
    author: {
      "@type": "Organization",
      name: COMPANY_INFO.name,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: COMPANY_INFO.name,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: FaqPair[] }) {
  if (faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ItemListJsonLd({
  name,
  description,
  urlPath,
  posts,
  lang,
}: {
  name: string;
  description: string;
  urlPath: string;
  posts: PostMeta[];
  lang: "ja" | "en";
}) {
  const listUrl = `${BASE_URL}${urlPath}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: listUrl,
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: post.title,
      url: mediaUrl(post.slug, lang),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
