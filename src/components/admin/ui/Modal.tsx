"use client";

import { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton } from "./IconButton";

type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: Size;
  children: ReactNode;
  /** Sticky footer area (e.g. Cancel / Save buttons). */
  footer?: ReactNode;
}

/**
 * Themed modal wrapping headlessui Dialog (focus trap + restore + Esc handled).
 * Standardizes the admin's many ad-hoc Dialog implementations.
 */
export function Modal({ open, onClose, title, description, size = "md", children, footer }: ModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="admin-theme relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0"
            style={{ backgroundColor: "var(--admin-overlay)" }}
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto [overscroll-behavior:contain]">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${SIZES[size]} overflow-hidden rounded-xl bg-admin-surface shadow-admin-popover ring-1 ring-admin-hairline`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-admin-hairline px-6 py-4">
                  <div className="min-w-0">
                    <Dialog.Title className="text-lg font-semibold text-admin-heading">
                      {title}
                    </Dialog.Title>
                    {description && (
                      <p className="mt-0.5 text-sm text-admin-ink-muted text-pretty">
                        {description}
                      </p>
                    )}
                  </div>
                  <IconButton label="Close" icon={<XMarkIcon />} onClick={onClose} />
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

                {footer && (
                  <div className="flex justify-end gap-2 border-t border-admin-hairline bg-admin-surface px-6 py-4">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
