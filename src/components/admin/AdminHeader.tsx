"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminHeader() {
  const { logout, authUser } = useAuth();

  return (
    <header className="border-b border-admin-hairline bg-admin-surface">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-end">
          {/* Profile dropdown */}
          <Menu as="div" className="relative ml-3">
            <Menu.Button className="flex items-center gap-2 rounded-full p-0.5 text-sm transition-colors hover:opacity-90">
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon className="h-8 w-8 text-admin-brown" aria-hidden="true" />
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-lg bg-admin-surface py-1 shadow-admin-popover ring-1 ring-admin-hairline focus:outline-none">
                {authUser?.email && (
                  <div className="border-b border-admin-hairline px-4 py-3">
                    <p className="text-xs text-admin-ink-muted">Signed in as</p>
                    <p className="truncate text-sm font-medium text-admin-ink">
                      {authUser.email}
                    </p>
                  </div>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => logout()}
                      className={`${
                        active ? "bg-admin-surface-muted" : ""
                      } flex w-full items-center px-4 py-2 text-sm text-admin-ink`}
                    >
                      <ArrowRightOnRectangleIcon
                        className="mr-3 h-5 w-5 text-admin-ink-muted"
                        aria-hidden="true"
                      />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
