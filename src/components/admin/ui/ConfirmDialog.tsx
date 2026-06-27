"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  /** When set, the confirm button stays disabled until the user types this text. */
  requireText?: string;
}

/**
 * Themed confirmation modal — replaces `window.confirm` and the ad-hoc
 * type-to-confirm overlays. headlessui handles focus trap + restore + Esc.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  requireText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const matched = !requireText || typed.trim() === requireText;

  const close = () => {
    if (loading) return;
    setTyped("");
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={close} className="admin-theme relative z-50">
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

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-admin-surface p-6 shadow-admin-popover ring-1 ring-admin-hairline">
              <div className="flex gap-4">
                {danger && (
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: "#F4E0DC" }}
                  >
                    <ExclamationTriangleIcon
                      className="h-5 w-5 text-admin-danger"
                      aria-hidden="true"
                    />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <Dialog.Title className="text-lg font-semibold text-admin-heading">
                    {title}
                  </Dialog.Title>
                  {description && (
                    <p className="mt-1 text-sm text-admin-ink-muted text-pretty">
                      {description}
                    </p>
                  )}
                  {requireText && (
                    <div className="mt-4">
                      <label
                        htmlFor="confirm-text"
                        className="mb-1 block text-xs text-admin-ink-muted"
                      >
                        Type <span className="font-semibold text-admin-ink">{requireText}</span> to
                        confirm
                      </label>
                      <input
                        id="confirm-text"
                        autoComplete="off"
                        spellCheck={false}
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        className="block w-full rounded-md border border-admin-hairline bg-admin-surface px-3 py-2 text-sm text-admin-ink placeholder:text-admin-ink-subtle"
                        placeholder={requireText}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={close} disabled={loading}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={danger ? "danger" : "primary"}
                  size="sm"
                  onClick={onConfirm}
                  loading={loading}
                  disabled={!matched}
                >
                  {confirmLabel}
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
