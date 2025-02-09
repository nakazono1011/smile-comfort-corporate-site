import Link from "next/link";

import { formatDistance } from "date-fns";
import { ja } from "date-fns/locale";

import { Post } from "../types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/media/${post.slug}`}
      className="group transition-all hover:no-underline"
    >
      <article className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg ">
        {/* <div className="relative h-48">
          <Image
            src={post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "/noimage.png"}
            alt={post.title.rendered}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div> */}

        <div className="p-4">
          <h2
            className="mb-2 text-xl font-semibold text-gray-900"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <p className="mb-3 text-sm text-gray-500">
            {formatDistance(
              new Date(post.date + "+0900"),
              new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
              ),
              {
                addSuffix: true,
                locale: ja,
              }
            )}
          </p>
          <div
            className="line-clamp-3 text-gray-600"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
        </div>
      </article>
    </Link>
  );
}
