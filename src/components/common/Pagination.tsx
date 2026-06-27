import { useEffect, useMemo, useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (totalPages <= 1) return null;

  const getVisiblePages = useMemo(() => {
    const delta = isMobile ? 1 : 3;
    const isPrevVisible = currentPage - delta > 1;
    const isNextVisible = currentPage + delta < totalPages;
    const isPrevDotsVisible = currentPage - delta > 2;
    const isNextDotsVisible = currentPage + delta < totalPages - 1;

    const pages = [];
    if (isPrevVisible) {
      pages.push(1);
    }
    if (isPrevDotsVisible) {
      pages.push("...");
    }
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }
    if (isNextDotsVisible) {
      pages.push("...");
    }
    if (isNextVisible) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, isMobile]);

  return (
    <nav
      aria-label="Pagination"
      className={`flex justify-center items-center ${className}`}
    >
      <ul className="flex items-center gap-1 sm:gap-3">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="px-2 sm:px-4 py-2 text-sm sm:text-base font-medium text-ink rounded-lg border border-hairline bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Previous
          </button>
        </li>

        {getVisiblePages.map((page: number | string, index: number) => (
          <li key={`page-${index}`}>
            {page === "..." ? (
              <span
                aria-hidden="true"
                className="px-2 sm:px-3 py-2 text-sm sm:text-base font-medium text-ink-muted"
              >
                {page}
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  currentPage === page
                    ? "bg-primary text-on-primary hover:bg-primary-hover"
                    : "text-ink hover:bg-surface-muted"
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="px-2 sm:px-4 py-2 text-sm sm:text-base font-medium text-ink rounded-lg border border-hairline bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
