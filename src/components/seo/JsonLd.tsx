import {
  BASE_URL,
  COMPANY_INFO,
  EXTERNAL_LINKS,
  OG_IMAGE,
} from "@/config/company";
import type { FaqPair, PostMeta } from "@/lib/mdx";

const ORG_SAME_AS = [
  EXTERNAL_LINKS.note,
  EXTERNAL_LINKS.traBell,
  EXTERNAL_LINKS.catamap,
] as const;

const mediaUrl = (slug: string, lang: "ja" | "en") =>
  lang === "en" ? `${BASE_URL}/en/media/${slug}` : `${BASE_URL}/media/${slug}`;

const absoluteUrl = (path: string) =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY_INFO.name,
    alternateName: COMPANY_INFO.nameEn,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
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
