import Link from "next/link";
import Image from "next/image";
import { AffiliateCTA } from "@/components/ui/AffiliateCTA";
import { Citation } from "@/components/ui/Citation";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  Link,
  Image,
  AffiliateCTA,
  Citation,
  h1: ({ children, ...props }) => (
    <h1
      className="text-2xl md:text-3xl font-bold text-primary mt-8 mb-4 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-xl md:text-2xl font-semibold text-primary mt-8 mb-4 border-b border-support-beige pb-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-lg md:text-xl font-semibold text-primary mt-6 mb-3"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-support-gray leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc list-inside space-y-2 mb-4 text-support-gray"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal list-inside space-y-2 mb-4 text-support-gray"
      {...props}
    >
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-accent bg-support-blue-light/30 p-4 my-6 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code
      className="bg-slate-800 text-green-400 px-2 py-1 rounded text-sm font-mono border border-slate-700"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono border border-slate-700 shadow-lg"
      {...props}
    >
      {children}
    </pre>
  ),
  img: ({ src, alt, ...props }) => (
    <span className="block w-full max-w-2xl mx-auto my-6">
      <Image
        src={src || ""}
        alt={alt || ""}
        width={800}
        height={400}
        className="w-full h-auto rounded-lg shadow-md border border-support-beige object-cover"
        {...props}
      />
    </span>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-6">
      <table
        className="min-w-full border-collapse border border-gray-300 bg-white shadow-sm rounded-lg"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300 last:border-r-0"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 last:border-r-0"
      {...props}
    >
      {children}
    </td>
  ),
};
