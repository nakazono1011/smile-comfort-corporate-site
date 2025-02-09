interface TableOfContentsProps {
  headings: {
    id: string;
    level: number;
    text: string;
  }[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="my-8 rounded-lg border border-gray-200 p-4" aria-label="目次">
      <h2 className="mb-4 text-xl font-bold">目次</h2>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${heading.level === 3 ? "ml-4" : ""} hover:text-blue-600`}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
