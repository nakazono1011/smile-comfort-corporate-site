import Image from "next/image";
import Link from "next/link";
import { getAuthor } from "@/config/authors";

interface AuthorBoxProps {
  authorId?: string;
  locale?: "ja" | "en";
}

export function AuthorBox({ authorId, locale = "ja" }: AuthorBoxProps) {
  const author = getAuthor(authorId);
  const label = locale === "ja" ? "この記事を書いた人" : "About the author";

  return (
    <aside className="not-prose my-12 rounded-2xl border border-slate-200 bg-support-beige/60 p-6 md:p-7">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
        {label}
      </div>
      <div className="flex items-start gap-5">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name[locale]}
            width={64}
            height={64}
            className="rounded-full object-cover flex-shrink-0"
          />
        ) : null}
        <div className="min-w-0">
          <div className="font-bold text-brand-deep text-lg">
            {author.url ? (
              <Link
                href={author.url}
                target={author.url.startsWith("http") ? "_blank" : undefined}
                rel={
                  author.url.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="hover:text-brand-green no-underline"
              >
                {author.name[locale]}
              </Link>
            ) : (
              author.name[locale]
            )}
          </div>
          <div className="text-sm text-slate-500 mb-2">
            {author.role[locale]}
          </div>
          <p className="text-[15px] text-slate-700 leading-relaxed">
            {author.bio[locale]}
          </p>
        </div>
      </div>
    </aside>
  );
}
