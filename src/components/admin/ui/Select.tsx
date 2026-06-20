"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  swatch?: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  id?: string;
  ariaLabel?: string;
  /** Extra trigger classes (e.g. width). */
  className?: string;
  disabled?: boolean;
}

/** Themed single-select dropdown with optional search and per-option descriptions. */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchable = false,
  id,
  ariaLabel,
  className = "",
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    if (searchable) setTimeout(() => searchRef.current?.focus(), 10);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, searchable]);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q)
    );
  }, [options, query, searchable]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border border-admin-hairline bg-admin-surface px-3 py-2 text-left text-sm text-admin-ink transition-colors hover:border-admin-gold/70 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.swatch && (
            <span
              className="h-4 w-4 flex-shrink-0 rounded-full ring-1 ring-admin-hairline"
              style={{ backgroundColor: selected.swatch }}
            />
          )}
          <span className={`truncate ${selected ? "" : "text-admin-ink-subtle"}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronUpDownIcon
          className="h-4 w-4 flex-shrink-0 text-admin-ink-subtle"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-admin-hairline bg-admin-surface shadow-admin-popover"
          role="listbox"
        >
          {searchable && (
            <div className="relative border-b border-admin-hairline p-2">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-ink-subtle"
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                spellCheck={false}
                aria-label="Search options"
                className="w-full rounded-md border border-admin-hairline bg-admin-surface py-1.5 pl-8 pr-2 text-sm text-admin-ink placeholder:text-admin-ink-subtle"
              />
            </div>
          )}
          <ul className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-admin-ink-subtle">
                No matches
              </li>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={o.disabled}
                      onClick={() => {
                        onChange(o.value);
                        close();
                      }}
                      className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-admin-surface-muted disabled:opacity-40 ${
                        active ? "bg-admin-gold-soft" : ""
                      }`}
                    >
                      {o.swatch && (
                        <span
                          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full ring-1 ring-admin-hairline"
                          style={{ backgroundColor: o.swatch }}
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-admin-ink">
                            {o.label}
                          </span>
                          {active && (
                            <CheckIcon
                              className="h-4 w-4 flex-shrink-0 text-admin-brown"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        {o.description && (
                          <span className="mt-0.5 block text-xs leading-snug text-admin-ink-muted">
                            {o.description}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
