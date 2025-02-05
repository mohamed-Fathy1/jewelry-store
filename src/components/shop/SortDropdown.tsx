"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { colors } from "@/constants/colors";

const sortOptions = [
  { name: "Newest", value: "Newest" },
  { name: "Price: Low to High", value: "Low to High" },
  { name: "Price: High to Low", value: "High to Low" },
  { name: "Most Popular", value: "Most Popular" },
];

interface SortDropdownProps {
  value: {
    sortBy: string;
  };
  onChange: (sortBy: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const getCurrentSortName = () => {
    const option = sortOptions.find((opt) => opt.value === value.sortBy);
    return option?.name || "";
  };

  return (
    <Menu
      as="div"
      className="relative inline-block text-left z-10 mr-3 md:mr-2"
    >
      <Menu.Button
        className="group inline-flex justify-center text-sm font-medium transition-colors duration-200 hover:text-[--text-secondary]"
        style={{ color: colors.textPrimary }}
      >
        Sort by: {getCurrentSortName()}
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
                    onClick={() => onChange(option.value)}
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
