"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const generatePagination = (currentPage: number, totalPages: number) => {
  // 総ページ数が5以下の場合、全ページを表示
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 現在のページが3より小さい場合、最初の3ページと最後の2ページを表示
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages - 1, totalPages];
  }

  // 現在のページが最後から2ページ以内の場合、最初の2ページと最後の3ページを表示
  if (currentPage >= totalPages - 2) {
    return [
      1,
      2,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // 上記のいずれにも当てはまらない場合、現在のページの前後1ページと最初と最後のページを表示
  return [
    1,
    2,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export default function Pagination({
  className,
  currentPage = 1,
  onPageClick,
  totalPages = 1,
}: {
  className?: string;
  currentPage: number;
  onPageClick?: (pageNumber: number) => void;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber?.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className={cn("flex items-center justify-between gap-x-2", className)}>
      <div className="flex gap-x-2 lg:gap-x-4">
        {allPages.map((page) => {
          return (
            <button
              key={`page-${page}`}
              onClick={() => {
                if (page !== "...") {
                  if (onPageClick) {
                    onPageClick(Number(page));
                  } else {
                    createPageURL(page);
                  }
                }
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:opacity-70",
                page === currentPage &&
                  "border border-black bg-primary font-semibold text-white",
                page === "..." && "cursor-not-allowed"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>
      <div>
        <button
          onClick={() =>
            onPageClick
              ? onPageClick(currentPage + 1)
              : createPageURL(currentPage + 1)
          }
          className={cn(
            "flex items-end bg-white text-gray-500 hover:text-gray-700",
            {
              hidden: currentPage === totalPages || totalPages <= 5,
            }
          )}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
