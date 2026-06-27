import type { Metadata } from "next";
import { getPostMeta, type PostMeta } from "@/lib/mdx";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGE } from "@/config/company";

export function generateMetadata(): Metadata {
  return {
    title: "メディア・記事一覧 | 合同会社スマイルコンフォート",
    description:
      "EC 運営・スクレイピング基盤・パスワード管理など、現場で使えるツール導入ノウハウを発信するメディア。",
    alternates: {
      canonical: "/media",
      languages: { ja: "/media", en: "/en/media" },
    },
    openGraph: {
      title: "メディア・記事一覧 | 合同会社スマイルコンフォート",
      description:
        "EC 運営・スクレイピング基盤・パスワード管理など、現場で使えるツール導入ノウハウを発信するメディア。",
      url: "/media",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_IMAGE.url],
    },
  };
}

export default async function MediaList() {
  const posts = await getPostMeta("ja", { featuredFirst: true });
  const featured = posts.filter((p) => p.featured).slice(0, 4);
  const featuredSlugs = new Set(featured.map((p) => p.slug));
  const recent = posts.filter((p) => !featuredSlugs.has(p.slug));

  return (
    <div className="min-h-screen bg-white pt-20">
      <ItemListJsonLd
        name="メディア・記事一覧"
        description="EC・スクレイピング・セキュリティの現場ノウハウ"
        urlPath="/media"
        posts={posts}
        lang="ja"
      />
      <SiteHeader />
      <main>
        <section className="border-b border-slate-100">
          <div className="container mx-auto px-5 py-20 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center rounded-full bg-brand-green/10 px-4 py-1.5 text-sm font-medium text-brand-deep mb-6">
                Smile Comfort Media
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-brand-deep leading-tight mb-6">
                ツール導入と運用を、
                <br className="hidden md:block" />
                実装目線で深堀りする。
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Next Engine・Bright Data・1Password など、ビジネス現場で実際に使えるツールの導入ガイドと運用ノウハウをお届けします。
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-5 pt-12 pb-24">
          {featured.length > 0 ? (
            <section className="mb-20">
              <div className="mb-8 flex items-end justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-deep">
                  注目記事
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {featured.map((post) => (
                  <ArticleCard
                    key={post.slug}
                    post={post}
                    locale="ja"
                    variant="featured"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {recent.length > 0 ? (
            <section>
              <div className="mb-8 flex items-end justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-deep">
                  最新記事
                </h2>
                <span className="text-sm text-slate-500">
                  全 {posts.length} 記事
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recent.map((post: PostMeta) => (
                  <ArticleCard key={post.slug} post={post} locale="ja" />
                ))}
              </div>
            </section>
          ) : null}

          {posts.length === 0 ? (
            <div className="py-24 text-center">
              <div className="inline-block rounded-2xl bg-support-beige px-8 py-10">
                <h3 className="text-xl font-semibold text-brand-deep mb-2">
                  記事を準備中です
                </h3>
                <p className="text-slate-600">
                  まもなく最初の記事を公開予定です。お楽しみに。
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
