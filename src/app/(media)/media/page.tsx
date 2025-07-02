import { getPostMeta, PostMeta } from "@/lib/mdx";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FileText, Rss } from "lucide-react";

export const generateMetadata = () => ({
  title: "メディア・記事一覧 | 合同会社スマイルコンフォート",
  description:
    "Web開発、EC運営、セキュリティに関する実用的な記事をお届け。プロキシ、スクレイピング、一元管理ツール、パスワード管理など、ビジネスに役立つ情報を発信中。",
});
export const revalidate = 60; // ISR: 60 秒

export default async function MediaList() {
  const posts = await getPostMeta("ja");

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
                  メディア・記事一覧
                </h1>
              </div>

              <p className="text-lg text-support-gray leading-relaxed mb-8">
                Web開発、EC運営、セキュリティに関する実用的な記事をお届けします。
                <br />
                ビジネスの効率化と成長をサポートする情報を発信中。
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-support-gray">
                <Rss className="w-4 h-4" />
                <span>全 {posts.length} 記事</span>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="container mx-auto px-4 py-12">
          {posts.length > 0 ? (
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {posts.map((post: PostMeta) => (
                <ArticleCard key={post.slug} post={post} locale="ja" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-support-beige/50 rounded-lg inline-block mb-4">
                <FileText className="w-8 h-8 text-support-gray mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                記事はまだありません
              </h3>
              <p className="text-support-gray">
                新しい記事を準備中です。しばらくお待ちください。
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
