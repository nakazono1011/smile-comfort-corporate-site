import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/mdx";

interface ArticleHeroProps {
  post: PostMeta;
  locale?: "ja" | "en";
  readingTime?: number;
}

export function ArticleHero({
  post,
  locale = "ja",
  readingTime,
}: ArticleHeroProps) {
  const baseUrl = locale === "en" ? "/en/media" : "/media";
  const backText = locale === "en" ? "Back to articles" : "記事一覧へ";
  const heroSrc = post.heroImage || post.cover;
  const computedReadTime = readingTime ?? post.readTime ?? 5;
  const formattedDate = new Date(post.date).toLocaleDateString(
    locale === "ja" ? "ja-JP" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <header className="mb-10">
      <div className="mb-6">
        <Link
          href={baseUrl}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-green transition-colors no-underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {backText}
        </Link>
      </div>

      {post.tags && post.tags.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {post.tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-brand-green/10 text-brand-deep hover:bg-brand-green/20"
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <h1 className="text-[32px] md:text-4xl lg:text-[40px] font-bold text-brand-deep leading-tight mb-6">
        {post.title}
      </h1>

      {post.summary ? (
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl">
          {post.summary}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 mb-8">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.date}>{formattedDate}</time>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {locale === "ja"
              ? `約 ${computedReadTime} 分`
              : `${computedReadTime} min read`}
          </span>
        </div>
      </div>

      {heroSrc ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[20px] border border-slate-100">
          <Image
            src={heroSrc}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 1112px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      ) : null}
    </header>
  );
}
