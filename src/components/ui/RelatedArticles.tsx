import { ArticleCard } from "@/components/ui/ArticleCard";
import type { PostMeta } from "@/lib/mdx";

interface RelatedArticlesProps {
  posts: PostMeta[];
  locale?: "ja" | "en";
}

export function RelatedArticles({ posts, locale = "ja" }: RelatedArticlesProps) {
  if (!posts || posts.length === 0) return null;
  const title = locale === "ja" ? "関連記事" : "Related articles";

  return (
    <section className="not-prose mt-20 border-t border-slate-200 pt-12">
      <h2 className="text-[28px] font-bold text-brand-deep mb-8">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <ArticleCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
