import { colors } from "@/constants/colors";

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
  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        style={{
          backgroundColor: "transparent",
          color: colors.textPrimary,
        }}
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className="px-4 py-2 rounded-md transition-colors cursor-pointer"
          style={{
            backgroundColor:
              currentPage === page ? colors.brown : "transparent",
            color: currentPage === page ? colors.textLight : colors.textPrimary,
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        style={{
          backgroundColor: "transparent",
          color: colors.textPrimary,
        }}
      >
        Next
      </button>
    </div>
  );
}
