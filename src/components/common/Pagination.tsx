import { colors } from "@/constants/colors";
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

  const baseButtonStyle = {
    color: colors.textPrimary,
    fontSize: isMobile ? "14px" : "16px",
    fontWeight: 500,
  };

  const activeButtonStyle = {
    backgroundColor: colors.brown,
    color: colors.textLight,
  };

  return (
    <nav className={`flex justify-center items-center ${className}`}>
      <ul className="flex items-center gap-1 sm:gap-3">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 sm:px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            style={baseButtonStyle}
          >
            Previous
          </button>
        </li>

        {getVisiblePages.map((page: number | string, index: number) => (
          <li key={`page-${index}`}>
            {page === "..." ? (
              <span className="px-2 sm:px-3 py-2" style={baseButtonStyle}>
                {page}
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md transition-colors flex items-center justify-center hover:bg-gray-100
                  ${currentPage === page ? "hover:bg-brown-600" : ""}`}
                style={{
                  ...baseButtonStyle,
                  ...(currentPage === page ? activeButtonStyle : {}),
                }}
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
            className="px-2 sm:px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            style={baseButtonStyle}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
