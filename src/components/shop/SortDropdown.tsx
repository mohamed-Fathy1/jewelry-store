"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/cn";
import { useSearchParams, useRouter } from "next/navigation";

// "Price: High to Low" is intentionally omitted: the backend has no descending
// price sort (only ascending `price`), so offering it would silently behave
// like Low-to-High. Re-add it here once the API supports a price-desc sort.
const sortOptions = [
  { name: "Newest", value: "Newest" },
  { name: "Price: Low to High", value: "Low to High" },
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

  const getCurrentSortName = () => {
    const option = sortOptions.find((opt) => opt.value === value.sortBy);
    return option?.name || "";
  };

  return (
    <Menu
      as="div"
      className="relative inline-block text-left z-10 mr-3 md:mr-2"
    >
      <Menu.Button className="group inline-flex justify-center text-sm font-medium text-ink transition-colors duration-200 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
        Sort by: {getCurrentSortName()}
        <ChevronDownIcon
          className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-ink-muted transition-colors duration-200 group-hover:text-heading"
          aria-hidden="true"
        />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-hairline bg-surface shadow-card-hover focus:outline-none">
          <div>
            {sortOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => {
                      onChange(option.value);
                      const newSearchParams = new URLSearchParams(
                        searchParams.toString()
                      );
                      newSearchParams.set("sort", option.value);
                      newSearchParams.set("price", price || "");
                      router.push(`/shop?${newSearchParams.toString()}`);
                    }}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm transition-colors duration-200",
                      active
                        ? "bg-primary text-on-primary"
                        : "text-ink"
                    )}
                  >
                    {option.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
