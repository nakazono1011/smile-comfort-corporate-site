"use client";

import { useTweet } from "react-tweet";
import { MagicTweet } from "@/components/ui/magic-tweet";

type ClientTweetCardProps = {
  id: string;
  className?: string;
};

export function ClientTweetCard({ id, className }: ClientTweetCardProps) {
  const { data, error, isLoading } = useTweet(id);

  if (isLoading) {
    return (
      <div className="not-prose my-8 flex w-full max-w-xl mx-auto flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-slate-100" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="not-prose my-8 max-w-xl mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        Failed to load tweet:{" "}
        <a
          href={`https://x.com/i/status/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View on X
        </a>
      </div>
    );
  }

  return <MagicTweet tweet={data} className={className} />;
}
