import {
  extractFaqsFromMdx,
  getPost,
  getPostMeta,
  type PostMeta,
} from "@/lib/mdx";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleHeader } from "@/components/ui/ArticleHeader";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArticleJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGE } from "@/config/company";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function generateStaticParams() {
  const posts = await getPostMeta("ja");
  return posts.map((p: PostMeta) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getPost(slug, "ja");
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
      tags: data.tags,
      images: data.cover ? [{ url: data.cover }] : [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.summary,
      images: data.cover ? [data.cover] : [OG_IMAGE.url],
    },
  };
}

export const revalidate = 60;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { content, data } = await getPost(slug, "ja");
  if (!data) notFound();

  const post = data as PostMeta;
  const faqs = extractFaqsFromMdx(content);

  // Calculate reading time (approximate)
  const readingTime = Math.max(1, Math.ceil(content.length / 1000));

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: {
      mdxOptions: {
        remarkPlugins: [(await import("remark-gfm")).default],
      },
    },
    components: mdxComponents,
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
        cover={post.cover}
      />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-white to-support-beige/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <article className="bg-white rounded-lg shadow-sm border border-support-beige/50 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <ArticleHeader
                      post={post}
                      locale="ja"
                      readingTime={readingTime}
                    />

                    {/* Inline TOC for mobile */}
                    <TableOfContents locale="ja" variant="inline" />

                    <div className="prose prose-lg max-w-none">
                      {mdxContent}
                    </div>

                    {/* Article Footer */}
                    <footer className="mt-12 pt-8 border-t border-support-beige">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-sm text-support-gray">
                          <p>
                            この記事が役に立ちましたら、ぜひシェアしてください。
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href="/media"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                          >
                            記事一覧へ
                          </Link>
                        </div>
                      </div>
                    </footer>
                  </div>
                </article>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <TableOfContents locale="ja" />

                  {/* Related Articles Placeholder */}
                  <div className="bg-white border border-support-beige rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-primary mb-3 text-sm uppercase tracking-wide">
                      関連記事
                    </h3>
                    <p className="text-sm text-support-gray">
                      関連記事の実装を準備中です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
