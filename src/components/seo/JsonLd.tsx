import { BASE_URL, COMPANY_INFO } from "@/config/company";

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
    sameAs: [],
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
  const url =
    lang === "en"
      ? `${BASE_URL}/en/media/${slug}`
      : `${BASE_URL}/media/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: date,
    dateModified: date,
    inLanguage: lang === "en" ? "en-US" : "ja-JP",
    image: cover ? `${BASE_URL}${cover}` : undefined,
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
