"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Package,
  PackageCheck,
  CheckCircle,
  MessageCircle,
  MessageSquare,
  Handshake,
  Gavel,
  ShieldBan,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DashboardStats {
  total_users: number;
  daily_active_users: number;
  listings_created: number;
  active_listings: number;
  completed_listings: number;
  active_chats: number;
  inquiry_chats: number;
  deal_chats: number;
  bids_placed: number;
  banned_users: number;
  trends?: {
    users_today?: number;
    users_yesterday?: number;
    listings_today?: number;
    listings_yesterday?: number;
    bids_today?: number;
    bids_yesterday?: number;
  };
}

const EMPTY_STATS: DashboardStats = {
  total_users: 0,
  daily_active_users: 0,
  listings_created: 0,
  active_listings: 0,
  completed_listings: 0,
  active_chats: 0,
  inquiry_chats: 0,
  deal_chats: 0,
  bids_placed: 0,
  banned_users: 0,
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
    label: "Total Listings",
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
    key: "bids_placed" as const,
    label: "Total Bids",
    icon: Gavel,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    key: "active_chats" as const,
    label: "Active Chats",
    icon: MessageCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "inquiry_chats" as const,
    label: "Inquiry Chats",
    icon: MessageSquare,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    key: "deal_chats" as const,
    label: "Deal Chats",
    icon: Handshake,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    key: "banned_users" as const,
    label: "Banned Users",
    icon: ShieldBan,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

function TrendBadge({ current, previous }: { current?: number; previous?: number }) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
        <Minus size={10} /> 0%
      </span>
    );
  }
  const pct = previous === 0 ? 100 : Math.round((diff / previous) * 100);
  const isUp = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
        isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      }`}
    >
      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isUp ? "+" : ""}
      {pct}%
    </span>
  );
}

/** Simple bar chart rendered with plain divs */
function MiniBarChart({ data, label }: { data: { day: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">{label}</p>
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d) => {
          const h = Math.max((d.value / max) * 100, 4);
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-gray-500">{d.value}</span>
              <div
                className="w-full rounded-t-md bg-indigo-400 transition-all"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-gray-400">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  /* Build trend chart placeholder data from the trends object */
  const trendCharts = useMemo(() => {
    const t = stats.trends;
    if (!t) return null;
    const days = ["6d", "5d", "4d", "3d", "2d", "Yest", "Today"];
    /* Only today/yesterday are provided by the API; others shown as zero */
    function series(today?: number, yesterday?: number) {
      return days.map((day, i) => ({
        day,
        value: i === days.length - 1 ? (today ?? 0) : i === days.length - 2 ? (yesterday ?? 0) : 0,
      }));
    }
    return {
      users: series(t.users_today, t.users_yesterday),
      listings: series(t.listings_today, t.listings_yesterday),
      bids: series(t.bids_today, t.bids_yesterday),
    };
  }, [stats.trends]);

  return (
    <div className="p-4 lg:p-8 max-w-[1400px]">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        {statCards.map((card) => {
          const value = stats[card.key];
          const trends = stats.trends;
          let trendCurrent: number | undefined;
          let trendPrevious: number | undefined;
          if (trends && card.key === "total_users") {
            trendCurrent = trends.users_today;
            trendPrevious = trends.users_yesterday;
          } else if (trends && card.key === "listings_created") {
            trendCurrent = trends.listings_today;
            trendPrevious = trends.listings_yesterday;
          } else if (trends && card.key === "bids_placed") {
            trendCurrent = trends.bids_today;
            trendPrevious = trends.bids_yesterday;
          }

          return (
            <div
              key={card.key}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
              >
                <card.icon size={22} className={card.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  {card.label}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-gray-900">
                    {loading ? (
                      <span className="inline-block h-5 w-16 animate-pulse rounded bg-gray-100" />
                    ) : (
                      (value ?? 0).toLocaleString()
                    )}
                  </p>
                  {!loading && <TrendBadge current={trendCurrent} previous={trendPrevious} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend charts */}
      {trendCharts && (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          <MiniBarChart data={trendCharts.users} label="New Users (Last 7 Days)" />
          <MiniBarChart data={trendCharts.listings} label="Listings Created (Last 7 Days)" />
          <MiniBarChart data={trendCharts.bids} label="Bids Placed (Last 7 Days)" />
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8 lg:mt-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
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
          </Link>
          <Link
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
          </Link>
          <Link
            href="/admin/chats"
            className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <MessageCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Chat Activity
              </p>
              <p className="text-xs text-gray-500">
                View chat counts and recent conversations
              </p>
            </div>
          </Link>
          <button
            onClick={fetchStats}
            className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow text-left"
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
          </button>
        </div>
      </div>
    </div>
  );
}
