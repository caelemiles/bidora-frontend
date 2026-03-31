"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Package,
  MessageCircle,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/chats", label: "Chats", icon: MessageCircle },
];

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAdminToken() {
  return localStorage.getItem("admin_token");
}

function getServerSnapshot() {
  return null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const adminToken = useSyncExternalStore(subscribeToStorage, getAdminToken, getServerSnapshot);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoginPage && !adminToken) {
      router.replace("/admin/login");
    }
  }, [isLoginPage, adminToken, router]);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!adminToken) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-60 flex-col bg-white border-r border-gray-100">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] shadow">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-gray-900">
              Bidora
            </span>
            <span className="ml-1 text-xs font-medium text-gray-400">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {adminNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <LogOut size={20} strokeWidth={1.8} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between bg-white border-b border-gray-100 px-4 h-14">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
          <span className="text-base font-bold text-gray-900">
            Admin
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-gray-500 hover:text-gray-700"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-14 bottom-0 z-50 w-60 flex-col bg-white border-r border-gray-100 flex">
            <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
              {adminNav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <LogOut size={20} strokeWidth={1.8} />
                Log Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:pl-60 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
