import Link from "next/link";
import Image from "next/image";
import type { MDXComponents } from "mdx/types";
import type { ImgHTMLAttributes } from "react";
import { Citation } from "@/components/ui/Citation";
import { TweetCard } from "@/components/ui/TweetCard";
import { ClientTweetCard } from "@/components/ui/ClientTweetCard";
import { InlineCTA } from "@/components/ui/InlineCTA";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { Figure } from "@/components/ui/Figure";
import { Callout } from "@/components/ui/Callout";
import { uniqueSlug } from "@/lib/slugify";

export function createMdxComponents(
  slugRegistry = new Map<string, number>(),
): MDXComponents {
  return {
    Link,
    Image,
    Citation,
    TweetCard,
    ClientTweetCard,
    InlineCTA,
    FAQAccordion,
    Figure,
    Callout,

    h1: ({ children, ...props }) => (
      <h1
        className="text-3xl md:text-4xl font-bold text-brand-deep mt-10 mb-6 first:mt-0 leading-tight"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        id={uniqueSlug(children, slugRegistry)}
        className="text-h2-article font-bold text-brand-deep mt-14 mb-5 leading-snug scroll-mt-24"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        id={uniqueSlug(children, slugRegistry)}
        className="text-h3-article font-semibold text-brand-deep mt-10 mb-3 leading-snug scroll-mt-24"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        className="text-lg font-semibold text-brand-deep mt-8 mb-2"
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p className="text-body-lg text-slate-700 mb-6" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul
        className="list-disc pl-6 mb-6 space-y-2 text-body-lg text-slate-700 marker:text-brand-green"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="list-decimal pl-6 mb-6 space-y-2 text-body-lg text-slate-700 marker:text-brand-green marker:font-semibold"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="pl-1 leading-[1.7]" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-brand-green bg-brand-green/5 px-5 py-4 my-8 rounded-r-xl text-slate-700 italic [&>p]:mb-2 [&>p:last-child]:mb-0"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }) => (
      <code
        className="bg-slate-100 text-brand-deep px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-slate-200"
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => (
      <pre
        className="bg-slate-900 text-slate-100 p-5 rounded-2xl overflow-x-auto my-8 text-sm font-mono [&>code]:bg-transparent [&>code]:border-0 [&>code]:p-0 [&>code]:text-slate-100"
        {...props}
      >
        {children}
      </pre>
    ),
    img: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => {
      if (!src || typeof src !== "string") return null;
      return (
        <span className="not-prose block my-10">
          <Image
            src={src}
            alt={alt || ""}
            width={1200}
            height={675}
            sizes="(max-width: 768px) 100vw, 1112px"
            className="w-full h-auto rounded-2xl shadow-sm border border-slate-100 object-cover mx-auto"
            unoptimized
            {...(props as Record<string, unknown>)}
          />
        </span>
      );
    },
    a: ({ children, href, ...props }) => {
      if (!href) return <a {...props}>{children}</a>;
      const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-brand-green underline underline-offset-4 hover:text-brand-deep transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },
    hr: (props) => <hr className="my-12 border-slate-200" {...props} />,
    table: ({ children, ...props }) => (
      <div className="not-prose overflow-x-auto my-10 rounded-2xl border border-slate-200">
        <table className="min-w-full border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-support-beige" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }) => (
      <tr className="border-t border-slate-200 first:border-t-0" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th
        className="px-5 py-3.5 text-left text-sm font-semibold text-brand-deep"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className="px-5 py-3.5 text-[15px] text-slate-700 align-top"
        {...props}
      >
        {children}
      </td>
    ),
  };
}
