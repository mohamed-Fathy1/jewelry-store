"use client";

import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { colors } from "@/constants/colors";

const sortOptions = [
  { name: "Most Popular", value: "popular" },
  { name: "Newest", value: "newest" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
];

export default function SortDropdown() {
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        className="group inline-flex justify-center text-sm font-medium transition-colors duration-200 hover:text-[--text-secondary]"
        style={{ color: colors.textPrimary }}
      >
        Sort by: {selectedSort.name}
        <ChevronDownIcon
          className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 transition-colors duration-200 hover:text-[--text-primary]"
          style={{ color: colors.textSecondary }}
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
        <Menu.Items
          className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-2xl ring-1 focus:outline-none"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <div>
            {sortOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => setSelectedSort(option)}
                    className={`${
                      active ? "bg-opacity-10" : ""
                    } block w-full text-left px-4 py-2 text-sm
                    first:rounded-t-md last:rounded-b-md
                    transition-colors duration-200`}
                    style={{
                      backgroundColor: active ? colors.brown : "transparent",
                      color: active ? colors.textLight : colors.textPrimary,
                    }}
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
