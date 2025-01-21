"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export function Select({ value, onChange, options }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={selectRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border rounded-md flex items-center justify-between transition-colors"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
      >
        <span>
          {selectedOption ? selectedOption.label : "Select an option"}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: colors.textSecondary }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 border rounded-md shadow-lg"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left transition-colors hover:bg-opacity-50 first:rounded-t-md last:rounded-b-md"
              style={{
                color: colors.textPrimary,
                backgroundColor:
                  option.value === value
                    ? `${colors.brown}15`
                    : colors.background,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
