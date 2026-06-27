"use client";

import { ChangeEvent } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./Button";

/** Prev / page-indicator / next bar. Hidden when there's a single page. */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className={`mt-4 flex items-center justify-between ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
      >
        Previous
      </Button>
      <span className="tabular text-sm text-admin-ink-muted">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        rightIcon={<ChevronRightIcon className="h-4 w-4" />}
      >
        Next
      </Button>
    </div>
  );
}

/** Themed search field with a leading magnifying-glass icon. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
  ariaLabel = "Search",
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-ink-subtle"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        spellCheck={false}
        className="w-full rounded-md border border-admin-hairline bg-admin-surface py-2 pl-10 pr-4 text-sm text-admin-ink transition-colors placeholder:text-admin-ink-subtle"
      />
    </div>
  );
}

interface SegmentedOption {
  value: string;
  label: string;
}

/** Pill segmented control (e.g. Active / Deleted). */
export function SegmentedToggle({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  className?: string;
}) {
  return (
    <div
      className={`inline-flex rounded-lg border border-admin-hairline bg-admin-surface p-0.5 ${className}`}
      role="group"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-admin-brown text-admin-on-accent"
                : "text-admin-ink-muted hover:text-admin-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
