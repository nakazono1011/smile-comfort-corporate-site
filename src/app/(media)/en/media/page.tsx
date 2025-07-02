import { getPostMeta, PostMeta } from "@/lib/mdx";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FileText, Rss } from "lucide-react";

export const generateMetadata = () => ({ 
  title: "Media & Articles | Smile Comfort LLC",
  description: "Practical articles on web development, e-commerce operations, and security. Featuring topics on proxies, web scraping, OMS tools, password management, and more business-focused content."
});
export const revalidate = 60; // ISR: 60 seconds

export default async function MediaList() {
  const posts = await getPostMeta("en");

  return (
    <div className="min-h-screen bg-white pt-20">
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-white to-support-beige/30">
        {/* Hero Section */}
        <section className="bg-white border-b border-support-beige">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                  Media & Articles
                </h1>
              </div>
              
              <p className="text-lg text-support-gray leading-relaxed mb-8">
                Practical articles on web development, e-commerce operations, and security.<br />
                Delivering information to support business efficiency and growth.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-support-gray">
                <Rss className="w-4 h-4" />
                <span>{posts.length} articles total</span>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="container mx-auto px-4 py-12">
          {posts.length > 0 ? (
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {posts.map((post: PostMeta) => (
                <ArticleCard key={post.slug} post={post} locale="en" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-support-beige/50 rounded-lg inline-block mb-4">
                <FileText className="w-8 h-8 text-support-gray mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">No articles yet</h3>
              <p className="text-support-gray">
                New articles are being prepared. Please check back later.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
