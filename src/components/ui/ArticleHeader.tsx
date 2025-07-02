import { Calendar, Clock, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostMeta } from "@/lib/mdx";

interface ArticleHeaderProps {
  post: PostMeta;
  locale?: string;
  readingTime?: number;
}

export function ArticleHeader({
  post,
  locale = "ja",
  readingTime = 5,
}: ArticleHeaderProps) {
  const baseUrl = locale === "en" ? "/en/media" : "/media";
  const backText = locale === "en" ? "Back to Articles" : "記事一覧へ";

  return (
    <header className="mb-8 pb-8 border-b border-support-beige">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-support-gray hover:text-accent"
        >
          <Link href={baseUrl} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {backText}
          </Link>
        </Button>
      </div>

      {/* Article Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
        {post.title}
      </h1>

      {/* Article Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 text-sm text-support-gray">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(
                locale === "ja" ? "ja-JP" : "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </time>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              {locale === "ja"
                ? `約 ${readingTime} 分`
                : `${readingTime} min read`}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Tag className="w-4 h-4 text-support-gray flex-shrink-0" />
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-support-blue-light text-primary hover:bg-accent/10 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {post.summary && (
        <div className="mt-6 p-4 bg-support-blue-light/30 rounded-lg border-l-4 border-accent">
          <p className="text-support-gray leading-relaxed italic">
            {post.summary}
          </p>
        </div>
      )}
    </header>
  );
}
