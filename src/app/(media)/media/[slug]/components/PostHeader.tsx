import Image from "next/image";

import createDOMPurify from "isomorphic-dompurify";

import { PostDetail } from "../../types";

interface PostHeaderProps {
  post: PostDetail;
}

export function PostHeader({ post }: PostHeaderProps) {
  const sanitizedTitle = createDOMPurify.sanitize(post.title.rendered);

  return (
    <header className="mb-8">
      {/* アイキャッチ画像 */}
      {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
        <div className="relative mb-8 h-[400px] overflow-hidden rounded-lg">
          <Image
            src={post._embedded["wp:featuredmedia"][0].source_url}
            alt={post._embedded["wp:featuredmedia"][0].alt_text || post.title.rendered}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 記事タイトル */}
      <h1
        className="mb-4 text-4xl font-bold"
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
      />

      {/* 投稿日・更新日 */}
      <div className="mb-4 flex items-center gap-4 text-gray-600">
        <div className="flex items-center gap-1">
          <span>投稿日：</span>
          <time dateTime={post.date} className="text-sm">
            {new Date(post.date).toLocaleDateString("ja-JP", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>

        <div className="flex items-center gap-1">
          <span>更新日：</span>
          <time dateTime={post.modified} className="text-sm">
            {new Date(post.modified).toLocaleDateString("ja-JP", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>
      </div>
    </header>
  );
}
