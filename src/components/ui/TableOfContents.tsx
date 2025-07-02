"use client";

import { useEffect, useState } from "react";
import { List, ChevronRight } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  locale?: string;
  variant?: "sidebar" | "inline";
}

export function TableOfContents({ locale = "ja", variant = "sidebar" }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from the page
    const headingElements = document.querySelectorAll("article h1, article h2, article h3, article h4");
    const headingData: Heading[] = [];

    headingElements.forEach((heading, index) => {
      // Skip the main title (first h1)
      if (heading.tagName === "H1" && index === 0) return;
      
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }
      
      headingData.push({
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.charAt(1)),
      });
    });

    setHeadings(headingData);

    // Set up intersection observer for active heading tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  const title = locale === "ja" ? "目次" : "Table of Contents";

  // Inline variant for mobile/header placement
  if (variant === "inline") {
    return (
      <nav className="mb-8 lg:hidden">
        <div className="bg-support-blue-light/30 border border-support-beige rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
            <List className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wide">{title}</span>
          </div>
          
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={`group flex items-start gap-2 text-sm transition-colors rounded px-2 py-1 ${
                    activeId === heading.id
                      ? "text-accent bg-white/80 font-medium"
                      : "text-support-gray hover:text-primary hover:bg-white/50"
                  }`}
                  style={{ paddingLeft: `${(heading.level - 2) * 12 + 8}px` }}
                >
                  <ChevronRight 
                    className={`w-3 h-3 mt-0.5 flex-shrink-0 transition-transform ${
                      activeId === heading.id ? "rotate-90" : "group-hover:rotate-90"
                    }`} 
                  />
                  <span className="leading-tight">{heading.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  // Sidebar variant for desktop
  return (
    <nav className="sticky top-8 max-h-[calc(100vh-6rem)] overflow-y-auto hidden lg:block">
      <div className="bg-white border border-support-beige rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
          <List className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wide">{title}</span>
        </div>
        
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`group flex items-start gap-2 text-sm transition-colors rounded px-2 py-1 ${
                  activeId === heading.id
                    ? "text-accent bg-support-blue-light/50 font-medium"
                    : "text-support-gray hover:text-primary hover:bg-support-beige/50"
                }`}
                style={{ paddingLeft: `${(heading.level - 2) * 12 + 8}px` }}
              >
                <ChevronRight 
                  className={`w-3 h-3 mt-0.5 flex-shrink-0 transition-transform ${
                    activeId === heading.id ? "rotate-90" : "group-hover:rotate-90"
                  }`} 
                />
                <span className="leading-tight">{heading.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}