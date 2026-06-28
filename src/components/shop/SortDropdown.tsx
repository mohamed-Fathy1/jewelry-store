"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  CheckIcon,
  SparklesIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";
import { useSearchParams, useRouter } from "next/navigation";

const sortOptions = [
  { name: "Newest", short: "Newest", value: "Newest", Icon: SparklesIcon },
  {
    name: "Price: Low to High",
    short: "Price ↑",
    value: "Low to High",
    Icon: BarsArrowUpIcon,
  },
  {
    name: "Price: High to Low",
    short: "Price ↓",
    value: "High to Low",
    Icon: BarsArrowDownIcon,
  },
];

interface SortDropdownProps {
  value: {
    sortBy: string;
  };
  onChange: (sortBy: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const price = searchParams.get("price");

  const activeOption = sortOptions.find((opt) => opt.value === value.sortBy);
  const chipLabel = activeOption?.short ?? "Sort";

  return (
    // z-40 lifts the open menu above the product grid overlays (heart / quick-add
    // buttons sit at z-10), so the dropdown is never painted over by a card.
    <Menu as="div" className="relative inline-block text-left z-40">
      {({ open }) => (
        <>
          <Menu.Button
            className={cn(
              "group inline-flex h-10 items-center gap-1.5 rounded-full border bg-surface pl-4 pr-3 text-sm font-medium shadow-soft transition-all duration-200 hover:border-primary/40 hover:text-heading hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              open
                ? "border-primary/50 text-heading shadow-card"
                : "border-hairline text-ink"
            )}
          >
            <span className="text-ink-muted transition-colors group-hover:text-ink">
              Sort:
            </span>
            <span className="tabular-nums">{chipLabel}</span>
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 text-ink-muted transition-transform duration-200 group-hover:text-heading",
                open && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="transform opacity-0 -translate-y-1 scale-95"
            enterTo="transform opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="transform opacity-100 translate-y-0 scale-100"
            leaveTo="transform opacity-0 -translate-y-1 scale-95"
          >
            <Menu.Items className="absolute right-0 z-40 mt-2.5 w-60 origin-top-right overflow-hidden rounded-2xl border border-hairline bg-surface p-1.5 shadow-card-hover ring-1 ring-noir/5 focus:outline-none">
              <p className="px-3 pb-1.5 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Sort by
              </p>
              {sortOptions.map(({ name, value: optValue, Icon }) => {
                const isActive = optValue === value.sortBy;
                return (
                  <Menu.Item key={optValue}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          onChange(optValue);
                          const newSearchParams = new URLSearchParams(
                            searchParams.toString()
                          );
                          newSearchParams.set("sort", optValue);
                          newSearchParams.set("price", price || "");
                          newSearchParams.set("page", "1");
                          router.push(`/shop?${newSearchParams.toString()}`);
                        }}
                        className={cn(
                          "group/row relative flex w-full items-center gap-3 rounded-xl py-2.5 pl-4 pr-3 text-left text-sm transition-colors duration-150",
                          active && !isActive && "bg-surface-sunken",
                          isActive
                            ? "bg-primary/10 font-semibold text-heading"
                            : "text-ink"
                        )}
                      >
                        {/* Left accent bar for the active option. */}
                        <span
                          className={cn(
                            "absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary transition-opacity duration-150",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                          aria-hidden="true"
                        />
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-all duration-150 group-hover/row:scale-110",
                            isActive ? "text-primary" : "text-ink-muted"
                          )}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{name}</span>
                        <span
                          className={cn(
                            "grid h-5 w-5 shrink-0 place-items-center rounded-full transition-all duration-150",
                            isActive
                              ? "bg-primary text-on-primary scale-100"
                              : "scale-0"
                          )}
                          aria-hidden="true"
                        >
                          <CheckIcon className="h-3 w-3" strokeWidth={2.5} />
                        </span>
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
