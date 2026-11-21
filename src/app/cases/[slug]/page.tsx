import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArticleJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { createMdxComponents } from "@/components/mdx/mdx-components";
import { consultHref, getCase, listCaseSlugs } from "@/lib/cases";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listCaseSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCase(slug);
  if (!c) return {};
  const image = { url: c.figureSrc, width: 1280, height: 720, alt: c.title };
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `/cases/${slug}` },
    openGraph: {
      title: c.title,
      description: c.description,
      type: "article",
      url: `/cases/${slug}`,
      modifiedTime: c.updated,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: [c.figureSrc],
    },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCase(slug);
  if (!c) notFound();

  const remarkGfm = (await import("remark-gfm")).default;
  const components = createMdxComponents(new Map<string, number>());
  const compile = (source: string) =>
    compileMDX({
      source,
      options: { mdxOptions: { format: "md", remarkPlugins: [remarkGfm] } },
      components,
    });
  const [{ content: body }, { content: footer }] = await Promise.all([
    compile(c.body),
    compile(c.footer),
  ]);

  return (
    <div className="min-h-screen bg-white pt-20">
      <ArticleJsonLd
        title={c.title}
        description={c.description}
        slug={c.slug}
        date={c.updated}
        dateModified={c.updated}
        urlPath={`/cases/${c.slug}`}
        lang="ja"
        cover={c.figureSrc}
      />
      <FaqJsonLd faqs={c.faqs} />
      <SiteHeader />
      <div className="container mx-auto px-5 py-12">
        <article className="mx-auto max-w-article">
          <div>{body}</div>
          <p className="my-10 text-center">
            <a
              href={consultHref(c.contactTopic)}
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-8 py-4 font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              {c.contactTopic}について相談する
            </a>
          </p>
          <div className="text-sm text-slate-500 [&>p]:mb-0 [&>p]:text-sm [&>p]:text-slate-500">
            {footer}
          </div>
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}
