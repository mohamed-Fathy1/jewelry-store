"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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
      className="inline-block h-4 w-4 rounded-full border border-hairline flex-shrink-0"
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
            ? `${className} text-left flex items-center justify-between text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`
            : "w-full px-4 py-2 text-left rounded-lg border border-hairline bg-surface text-ink flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        }
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedOption?.swatch && <Swatch hex={selectedOption.swatch} />}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={`w-5 h-5 flex-shrink-0 text-ink-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-lg border border-hairline bg-surface shadow-card max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-ink transition-colors hover:bg-surface-muted first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                option.value === value ? "bg-accent-soft" : "bg-surface"
              }`}
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
