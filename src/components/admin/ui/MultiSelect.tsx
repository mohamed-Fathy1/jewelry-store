"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "@/hooks/useDebounce";
import type { SelectOption } from "./Select";

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  /** The selectable pool. For async sources, pass current search results. */
  options: SelectOption[];
  /** Known labels for already-selected ids (e.g. populated edit data). */
  labelMap?: Record<string, string>;
  /** Provide for server-side search; omit to filter `options` client-side. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  ariaLabel?: string;
}

/**
 * Themed multi-select with search and removable chips. Replaces "paste
 * comma-separated IDs" inputs — keeps a label cache so chips stay readable as
 * async search results change.
 */
export function MultiSelect({
  values,
  onChange,
  options,
  labelMap,
  onSearch,
  loading = false,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results",
  id,
  ariaLabel,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cache, setCache] = useState<Record<string, string>>({});
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce((q: string) => onSearch?.(q), 300);

  // Keep a running id->label cache so chips keep their names across searches.
  useEffect(() => {
    setCache((prev) => {
      const next = { ...prev, ...(labelMap ?? {}) };
      for (const o of options) next[o.value] = o.label;
      return next;
    });
  }, [options, labelMap]);

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
    setTimeout(() => searchRef.current?.focus(), 10);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const labelFor = (v: string) => cache[v] ?? labelMap?.[v] ?? v;

  const filtered = useMemo(() => {
    if (onSearch || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, onSearch]);

  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  const handleQuery = (q: string) => {
    setQuery(q);
    if (onSearch) debouncedSearch(q);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-admin-hairline bg-admin-surface px-3 py-2 text-left text-sm transition-colors hover:border-admin-gold/70"
      >
        <span className={values.length ? "text-admin-ink" : "text-admin-ink-subtle"}>
          {values.length ? `${values.length} selected` : placeholder}
        </span>
        <ChevronUpDownIcon
          className="h-4 w-4 flex-shrink-0 text-admin-ink-subtle"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-admin-hairline bg-admin-surface shadow-admin-popover">
          <div className="relative border-b border-admin-hairline p-2">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-ink-subtle"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder={searchPlaceholder}
              spellCheck={false}
              aria-label="Search options"
              className="w-full rounded-md border border-admin-hairline bg-admin-surface py-1.5 pl-8 pr-2 text-sm text-admin-ink placeholder:text-admin-ink-subtle"
            />
          </div>
          <ul className="max-h-56 overflow-auto py-1" role="listbox" aria-multiselectable="true">
            {loading ? (
              <li className="px-3 py-6 text-center text-sm text-admin-ink-subtle">Searching…</li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-admin-ink-subtle">{emptyText}</li>
            ) : (
              filtered.map((o) => {
                const checked = values.includes(o.value);
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={checked}
                      onClick={() => toggle(o.value)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-admin-surface-muted"
                    >
                      <span
                        className={`grid h-4 w-4 flex-shrink-0 place-items-center rounded border ${
                          checked
                            ? "border-admin-brown bg-admin-brown text-admin-on-accent"
                            : "border-admin-hairline"
                        }`}
                      >
                        {checked && <CheckIcon className="h-3 w-3" aria-hidden="true" />}
                      </span>
                      {o.swatch && (
                        <span
                          className="h-4 w-4 flex-shrink-0 rounded-full ring-1 ring-admin-hairline"
                          style={{ backgroundColor: o.swatch }}
                        />
                      )}
                      <span className="truncate text-admin-ink">{o.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-admin-surface-muted py-1 pl-2.5 pr-1 text-xs font-medium text-admin-ink ring-1 ring-admin-hairline"
            >
              <span className="max-w-[12rem] truncate">{labelFor(v)}</span>
              <button
                type="button"
                aria-label={`Remove ${labelFor(v)}`}
                onClick={() => toggle(v)}
                className="grid h-4 w-4 place-items-center rounded-full text-admin-ink-muted transition-colors hover:bg-admin-danger/15 hover:text-admin-danger"
              >
                <XMarkIcon className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
