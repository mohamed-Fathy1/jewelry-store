"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";

interface SelectOption {
  value: string;
  label: string;
  // Optional hex color rendered as a small swatch before the label.
  swatch?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  // When provided, fully controls the trigger styling (used to match form
  // inputs). When omitted, the default standalone styling is used.
  className?: string;
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full border border-gray-200 flex-shrink-0"
      style={{ backgroundColor: hex }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
}: SelectProps) {
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
  const useCustomTrigger = Boolean(className);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          useCustomTrigger
            ? `${className} text-left flex items-center justify-between`
            : "w-full px-4 py-2 text-left border rounded-md flex items-center justify-between transition-colors"
        }
        style={
          useCustomTrigger
            ? { color: colors.textPrimary }
            : {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              }
        }
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedOption?.swatch && <Swatch hex={selectedOption.swatch} />}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: colors.textSecondary }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left transition-colors hover:bg-opacity-50 first:rounded-t-md last:rounded-b-md flex items-center gap-2"
              style={{
                color: colors.textPrimary,
                backgroundColor:
                  option.value === value
                    ? `${colors.brown}15`
                    : colors.background,
              }}
            >
              {option.swatch && <Swatch hex={option.swatch} />}
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
