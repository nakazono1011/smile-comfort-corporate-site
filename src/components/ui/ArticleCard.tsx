import Link from "next/link";
import Image from "next/image";
import { getAuthor } from "@/config/authors";
import type { PostMeta } from "@/lib/mdx";

interface ArticleCardProps {
  post: PostMeta;
  locale?: "ja" | "en";
  variant?: "default" | "featured";
}

export function ArticleCard({
  post,
  locale = "ja",
  variant = "default",
}: ArticleCardProps) {
  const baseUrl = locale === "en" ? "/en/media" : "/media";
  const href = `${baseUrl}/${post.slug}`;
  const author = getAuthor(post.author);
  const cover = post.cover || post.ogImage;
  const readTime =
    post.readTime ?? Math.max(1, Math.ceil(post.summary.length / 200));
  const formattedDate = new Date(post.date).toLocaleDateString(
    locale === "ja" ? "ja-JP" : "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const isFeatured = variant === "featured";

  return (
    <article
      className={[
        "group relative flex flex-col overflow-hidden",
        "rounded-2xl border border-slate-200 bg-white",
        "shadow-sm hover:shadow-xl transition-all duration-300",
      ].join(" ")}
    >
      <Link href={href} className="block no-underline">
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          {cover ? (
            <Image
              src={cover}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-green/10 via-white to-support-blue-light/40">
              <span className="font-display text-lg text-brand-deep/70 px-6 text-center">
                {post.title}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.tags && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-deep"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link href={href} className="block no-underline">
          <h3
            className={[
              "font-semibold text-brand-deep leading-snug line-clamp-2",
              "group-hover:text-brand-green transition-colors",
              isFeatured ? "text-xl" : "text-lg",
            ].join(" ")}
          >
            {post.title}
          </h3>
        </Link>

        {post.summary && isFeatured ? (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {post.summary}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <span className="truncate">
            {locale === "ja" ? "by " : "by "}
            <span className="text-slate-700 font-medium">
              {author.name[locale]}
            </span>
          </span>
          <span className="flex items-center gap-3 flex-shrink-0">
            <time dateTime={post.date}>{formattedDate}</time>
            <span aria-hidden>·</span>
            <span>
              {locale === "ja" ? `${readTime}分` : `${readTime} min read`}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
