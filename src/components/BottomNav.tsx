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
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
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
  );
}
