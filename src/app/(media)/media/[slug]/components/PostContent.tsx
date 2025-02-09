import { cn } from "@/lib/utils";
import createDOMPurify from "isomorphic-dompurify";

interface PostContentProps {
  className?: string;
  content: string;
}

export function PostContent({ className, content }: PostContentProps) {
  const sanitized = createDOMPurify.sanitize(content);

  return (
    <article
      className={cn(
        "prose prose-lg max-w-none prose-headings:font-bold prose-h2:rounded prose-h2:bg-primary/10 prose-h2:p-2 prose-a:text-blue-600 prose-img:rounded-lg",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
