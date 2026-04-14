import { getPost, getPostMeta, type PostMeta } from "@/lib/mdx";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleHeader } from "@/components/ui/ArticleHeader";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function generateStaticParams() {
  const posts = await getPostMeta("en");
  return posts.map((p: PostMeta) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getPost(slug, "en");
  return {
    title: data.title,
    description: data.summary,
    alternates: {
      canonical: `/en/media/${slug}`,
      languages: { ja: `/media/${slug}`, en: `/en/media/${slug}` },
    },
    openGraph: {
      title: data.title,
      description: data.summary,
      type: "article",
      publishedTime: data.date,
      tags: data.tags,
      images: data.cover ? [{ url: data.cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.summary,
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
  const { content, data } = await getPost(slug, "en");
  if (!data) notFound();

  const post = data as PostMeta;

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
        lang="en"
        tags={post.tags}
        cover={post.cover}
      />
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
                      locale="en"
                      readingTime={readingTime}
                    />

                    {/* Inline TOC for mobile */}
                    <TableOfContents locale="en" variant="inline" />

                    <div className="prose prose-lg max-w-none">
                      {mdxContent}
                    </div>

                    {/* Article Footer */}
                    <footer className="mt-12 pt-8 border-t border-support-beige">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-sm text-support-gray">
                          <p>
                            If you found this article helpful, please share it.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href="/en/media"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                          >
                            Back to Articles
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
                  <TableOfContents locale="en" />

                  {/* Related Articles Placeholder */}
                  <div className="bg-white border border-support-beige rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-primary mb-3 text-sm uppercase tracking-wide">
                      Related Articles
                    </h3>
                    <p className="text-sm text-support-gray">
                      Related articles feature coming soon.
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
