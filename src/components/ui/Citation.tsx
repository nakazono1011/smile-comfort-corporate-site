import React from "react";
import { ExternalLink } from "lucide-react";

interface CitationProps {
  source: string;
  title?: string;
  author?: string;
  date?: string;
  className?: string;
}

export function Citation({ 
  source, 
  title, 
  author, 
  date, 
  className = "" 
}: CitationProps) {
  return (
    <div className={`bg-slate-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg ${className}`}>
      <div className="flex items-start gap-2">
        <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm text-slate-600 mb-1">
            <span className="font-medium">出典:</span>
            {title && (
              <span className="ml-2 font-medium text-slate-800">{title}</span>
            )}
          </div>
          <div className="text-sm text-slate-500 space-y-1">
            {author && (
              <div>
                <span className="font-medium">著者:</span> {author}
              </div>
            )}
            {date && (
              <div>
                <span className="font-medium">日付:</span> {date}
              </div>
            )}
            <div>
              <span className="font-medium">URL:</span>{" "}
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {source}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}