"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, PlusCircle, MessageCircle, User } from "lucide-react";

const tabs = [
  { href: "/listings", label: "Listings", icon: Store },
  { href: "/sell", label: "Sell", icon: PlusCircle },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((t) => {
          const active =
            pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <t.icon size={22} strokeWidth={active ? 2.4 : 1.8} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
