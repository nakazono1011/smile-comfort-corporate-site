import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/mdx";

interface ArticleCardProps {
  post: PostMeta;
  locale?: string;
}

export function ArticleCard({ post, locale = "ja" }: ArticleCardProps) {
  const baseUrl = locale === "en" ? "/en/media" : "/media";
  
  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-support-beige/50 hover:border-accent/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`${baseUrl}/${post.slug}`}
            className="flex-1 group-hover:text-accent transition-colors"
          >
            <h3 className="text-lg font-semibold leading-tight line-clamp-2 text-primary">
              {post.title}
            </h3>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-support-gray mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>約 {Math.max(1, Math.ceil(post.summary.length / 200))} 分</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Link href={`${baseUrl}/${post.slug}`} className="block group-hover:text-accent/80 transition-colors">
          <p className="text-support-gray leading-relaxed line-clamp-3 mb-4">
            {post.summary}
          </p>
        </Link>

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-support-gray flex-shrink-0" />
            <div className="flex gap-1 flex-wrap">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-support-blue-light text-primary hover:bg-accent/10 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-support-gray/10 text-support-gray">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}