"use client";

import { useState, useEffect } from "react";

interface SliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function Slider({ min, max, value, onChange }: SliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (type: "min" | "max", newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    let newLocalValue: [number, number];

    if (type === "min") {
      newLocalValue = [Math.min(clampedValue, localValue[1]), localValue[1]];
    } else {
      newLocalValue = [localValue[0], Math.max(clampedValue, localValue[0])];
    }

    setLocalValue(newLocalValue);
  };

  const handleBlur = () => {
    onChange(localValue);
    setIsDragging(null);
  };

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="relative h-2 bg-surface-sunken rounded-full">
        {/* Track Fill */}
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            right: `${100 - getPercentage(localValue[1])}%`,
          }}
        />

        {/* Min Handle */}
        <div
          className={`absolute w-4 h-4 -mt-1.5 -ml-2 rounded-full cursor-pointer border-2 border-primary ${
            isDragging === "min" ? "bg-primary" : "bg-surface"
          }`}
          style={{
            left: `${getPercentage(localValue[0])}%`,
          }}
        >
          <input
            type="range"
            min={min}
            max={max}
            value={localValue[0]}
            aria-label="Minimum price"
            onChange={(e) => handleChange("min", parseInt(e.target.value))}
            onBlur={handleBlur}
            onFocus={() => setIsDragging("min")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Max Handle */}
        <div
          className={`absolute w-4 h-4 -mt-1.5 -ml-2 rounded-full cursor-pointer border-2 border-primary ${
            isDragging === "max" ? "bg-primary" : "bg-surface"
          }`}
          style={{
            left: `${getPercentage(localValue[1])}%`,
          }}
        >
          <input
            type="range"
            min={min}
            max={max}
            value={localValue[1]}
            aria-label="Maximum price"
            onChange={(e) => handleChange("max", parseInt(e.target.value))}
            onBlur={handleBlur}
            onFocus={() => setIsDragging("max")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Price Display */}
      <div className="flex justify-between text-sm text-ink-muted">
        <span>EGP {localValue[0].toLocaleString()}</span>
        <span>EGP {localValue[1].toLocaleString()}</span>
      </div>
    </div>
  );
}
