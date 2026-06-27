"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name. */
  label?: string;
  id?: string;
  disabled?: boolean;
}

/** Themed switch with a visible keyboard focus ring (via the scoped admin rule). */
export function Toggle({ checked, onChange, label, id, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-admin-brown" : "bg-admin-surface-sunken"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-admin-surface shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
