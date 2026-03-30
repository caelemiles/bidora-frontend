"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Package, Plus, MessageCircle, Settings as SettingsIcon } from "lucide-react";

const tabs = [
  { href: "/listings", label: "Listings", icon: Store },
  { href: "/my-listings", label: "My Listings", icon: Package },
  { href: "/sell", label: "Create", icon: Plus, isCreate: true },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex justify-around items-end h-16 max-w-lg mx-auto px-2">
          {tabs.map((t) => {
            const active =
              pathname === t.href || pathname.startsWith(t.href + "/");

            if (t.isCreate) {
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className="flex flex-col items-center gap-0.5 -mt-5"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 ${
                      active
                        ? "bg-indigo-700 shadow-indigo-300 scale-105"
                        : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700 hover:scale-105"
                    }`}
                  >
                    <Plus size={28} strokeWidth={2.5} className="text-white" />
                  </span>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 ${
                      active ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    {t.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors py-2 px-1 ${
                  active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <t.icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px]">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar nav */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-56 flex-col bg-white border-r border-gray-100 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 mb-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-extrabold text-white shadow">
            B
          </span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">Bidora</span>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 px-3 flex-1">
          {tabs.map((t) => {
            const active =
              pathname === t.href || pathname.startsWith(t.href + "/");

            if (t.isCreate) {
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors mt-2 ${
                    active
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  <Plus size={20} strokeWidth={2.5} />
                  {t.label} Listing
                </Link>
              );
            }

            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <t.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Version */}
        <p className="text-[10px] text-gray-300 text-center mt-auto">Bidora v0.2</p>
      </nav>
    </>
  );
}
