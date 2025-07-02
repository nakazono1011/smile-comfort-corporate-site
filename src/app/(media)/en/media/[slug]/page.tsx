import { getPost, getPostMeta, type PostMeta } from "@/lib/mdx";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleHeader } from "@/components/ui/ArticleHeader";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

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
    title: `${data.title} | Smile Comfort LLC`,
    description: data.summary,
    openGraph: {
      title: data.title,
      description: data.summary,
      type: "article",
      publishedTime: data.date,
      tags: data.tags,
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
    components: { 
      Link,
      // Add custom components for better styling
      h1: ({ children, ...props }) => (
        <h1 className="text-2xl md:text-3xl font-bold text-primary mt-8 mb-4 first:mt-0" {...props}>
          {children}
        </h1>
      ),
      h2: ({ children, ...props }) => (
        <h2 className="text-xl md:text-2xl font-semibold text-primary mt-8 mb-4 border-b border-support-beige pb-2" {...props}>
          {children}
        </h2>
      ),
      h3: ({ children, ...props }) => (
        <h3 className="text-lg md:text-xl font-semibold text-primary mt-6 mb-3" {...props}>
          {children}
        </h3>
      ),
      p: ({ children, ...props }) => (
        <p className="text-support-gray leading-relaxed mb-4" {...props}>
          {children}
        </p>
      ),
      ul: ({ children, ...props }) => (
        <ul className="list-disc list-inside space-y-2 mb-4 text-support-gray" {...props}>
          {children}
        </ul>
      ),
      ol: ({ children, ...props }) => (
        <ol className="list-decimal list-inside space-y-2 mb-4 text-support-gray" {...props}>
          {children}
        </ol>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote className="border-l-4 border-accent bg-support-blue-light/30 p-4 my-6 italic" {...props}>
          {children}
        </blockquote>
      ),
      code: ({ children, ...props }) => (
        <code className="bg-slate-800 text-green-400 px-2 py-1 rounded text-sm font-mono border border-slate-700" {...props}>
          {children}
        </code>
      ),
      pre: ({ children, ...props }) => (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono border border-slate-700 shadow-lg" {...props}>
          {children}
        </pre>
      ),
      img: ({ src, alt, ...props }) => (
        <span className="block w-full max-w-2xl mx-auto my-6">
          <Image
            src={src || ""}
            alt={alt || ""}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg shadow-md border border-support-beige object-cover"
            {...props}
          />
        </span>
      ),
    },
  });

  return (
    <div className="min-h-screen bg-white pt-20">
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-white to-support-beige/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <article className="bg-white rounded-lg shadow-sm border border-support-beige/50 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <ArticleHeader post={post} locale="en" readingTime={readingTime} />
                    
                    {/* Inline TOC for mobile */}
                    <TableOfContents locale="en" variant="inline" />
                    
                    <div className="prose prose-lg max-w-none">
                      {mdxContent}
                    </div>
                    
                    {/* Article Footer */}
                    <footer className="mt-12 pt-8 border-t border-support-beige">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-sm text-support-gray">
                          <p>If you found this article helpful, please share it.</p>
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
