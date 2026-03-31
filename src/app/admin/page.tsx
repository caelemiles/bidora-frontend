"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  Package,
  PackageCheck,
  CheckCircle,
  MessageCircle,
  Gavel,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DashboardStats {
  total_users: number;
  daily_active_users: number;
  listings_created: number;
  active_listings: number;
  completed_listings: number;
  active_chats: number;
  bids_placed: number;
  revenue?: number;
}

const EMPTY_STATS: DashboardStats = {
  total_users: 0,
  daily_active_users: 0,
  listings_created: 0,
  active_listings: 0,
  completed_listings: 0,
  active_chats: 0,
  bids_placed: 0,
};

const statCards = [
  {
    key: "total_users" as const,
    label: "Total Users",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "daily_active_users" as const,
    label: "Daily Active Users",
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "listings_created" as const,
    label: "Listings Created",
    icon: Package,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "active_listings" as const,
    label: "Active Listings",
    icon: PackageCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    key: "completed_listings" as const,
    label: "Completed Listings",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "active_chats" as const,
    label: "Active Chats",
    icon: MessageCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "bids_placed" as const,
    label: "Bids Placed",
    icon: Gavel,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    key: "revenue" as const,
    label: "Revenue",
    icon: TrendingUp,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data: DashboardStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error("[Admin] Failed to fetch stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard stats"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of Bidora marketplace analytics
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Could not load live data
            </p>
            <p className="text-xs text-amber-600">{error}</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {statCards.map((card) => {
          const value = stats[card.key];
          return (
            <div
              key={card.key}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}
              >
                <card.icon size={22} className={card.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? (
                    <span className="inline-block h-5 w-16 animate-pulse rounded bg-gray-100" />
                  ) : card.key === "revenue" ? (
                    `$${(value ?? 0).toLocaleString()}`
                  ) : (
                    (value ?? 0).toLocaleString()
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-8 lg:mt-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Manage Users
              </p>
              <p className="text-xs text-gray-500">
                View, ban, or delete user accounts
              </p>
            </div>
          </a>
          <a
            href="/admin/listings"
            className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Package className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Manage Listings
              </p>
              <p className="text-xs text-gray-500">
                Review, moderate, and delete listings
              </p>
            </div>
          </a>
          <a
            href="/admin"
            onClick={async (e) => {
              e.preventDefault();
              await fetchStats();
            }}
            className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <RefreshCw className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Refresh Stats
              </p>
              <p className="text-xs text-gray-500">
                Reload analytics from backend
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
