// fallow-ignore-next-line code-duplication
import {
  resolveFaqs,
  getPost,
  getPostMeta,
  type PostMeta,
} from "@/lib/mdx";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { ArticleHero } from "@/components/ui/ArticleHero";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { RelatedArticles } from "@/components/ui/RelatedArticles";
import { InlineCTA } from "@/components/ui/InlineCTA";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { AuthorBox } from "@/components/ui/AuthorBox";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArticleJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGE } from "@/config/company";
import { createMdxComponents } from "@/components/mdx/mdx-components";

// fallow-ignore-next-line code-duplication
const LOCALE = "ja" as const;

export async function generateStaticParams() {
  const posts = await getPostMeta(LOCALE);
  return posts.map((p: PostMeta) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const { data } = await getPost(slug, LOCALE);
    const ogImg = data.ogImage || data.cover || OG_IMAGE.url;
    return {
      title: data.title,
      description: data.summary,
      alternates: {
        canonical: `/media/${slug}`,
        languages: { ja: `/media/${slug}`, en: `/en/media/${slug}` },
      },
      openGraph: {
        title: data.title,
        description: data.summary,
        type: "article",
        publishedTime: data.date,
        modifiedTime: data.updated || data.date,
        tags: data.tags,
        images: [{ url: ogImg }],
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.summary,
        images: [ogImg],
      },
    };
  } catch {
    return {};
  }
}

function pickRelated(
  all: PostMeta[],
  current: PostMeta,
  count = 3,
): PostMeta[] {
  const others = all.filter((p) => p.slug !== current.slug);
  const explicit = current.related
    ?.map((s) => others.find((p) => p.slug === s))
    .filter((p): p is PostMeta => Boolean(p));
  if (explicit && explicit.length >= count) return explicit.slice(0, count);

  const scored = others.map((p) => {
    let score = 0;
    if (current.product && p.product === current.product) score += 5;
    if (current.tags && p.tags) {
      for (const t of p.tags) if (current.tags.includes(t)) score += 1;
    }
    return { post: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const merged: PostMeta[] = [...(explicit ?? [])];
  for (const { post } of scored) {
    if (merged.length >= count) break;
    if (!merged.find((m) => m.slug === post.slug)) merged.push(post);
  }
  return merged.slice(0, count);
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post: PostMeta;
  let content: string;
  try {
    const res = await getPost(slug, LOCALE);
    if (!res.data) notFound();
    post = res.data as PostMeta;
    content = res.content;
  } catch {
    notFound();
  }

  const faqs = resolveFaqs(post, content);
  const allPosts = await getPostMeta(LOCALE);
  const related = pickRelated(allPosts, post);

  const readingTime =
    post.readTime ?? Math.max(1, Math.ceil(content.length / 1000));

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: {
      mdxOptions: {
        remarkPlugins: [(await import("remark-gfm")).default],
      },
    },
    components: createMdxComponents(new Map<string, number>()),
  });

  return (
    <div className="min-h-screen bg-white pt-20">
      <ArticleJsonLd
        title={post.title}
        description={post.summary}
        slug={post.slug}
        date={post.date}
        lang="ja"
        tags={post.tags}
        cover={post.heroImage || post.cover}
      />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}
      <SiteHeader />
      <div className="container mx-auto px-5 py-12">
        <article className="mx-auto max-w-article">
          <ArticleHero post={post} locale="ja" readingTime={readingTime} />

          {post.product ? <AffiliateDisclosure locale="ja" /> : null}

          <TableOfContents locale="ja" variant="inline" />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <div>{mdxContent}</div>

              {post.faq && post.faq.length > 0 ? (
                <FAQAccordion items={post.faq} locale="ja" />
              ) : null}

              <AuthorBox authorId={post.author} locale="ja" />

              {post.product ? (
                <InlineCTA
                  product={post.product}
                  locale="ja"
                  variant="large"
                  intent="primary"
                />
              ) : null}
            </div>

            <aside>
              <TableOfContents locale="ja" variant="sidebar" />
            </aside>
          </div>

          <RelatedArticles posts={related} locale="ja" />
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}
