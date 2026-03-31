"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageCircle,
  MessageSquare,
  Handshake,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatStats {
  total_chats: number;
  inquiry_chats: number;
  deal_chats: number;
  active_chats: number;
}

interface RecentChat {
  id: string;
  type: "inquiry" | "deal";
  participant_1?: string;
  participant_2?: string;
  listing_title?: string;
  last_message_at?: string;
  message_count?: number;
}

const EMPTY_STATS: ChatStats = {
  total_chats: 0,
  inquiry_chats: 0,
  deal_chats: 0,
  active_chats: 0,
};

export default function AdminChatsPage() {
  const [stats, setStats] = useState<ChatStats>(EMPTY_STATS);
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [statsRes, chatsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/chats/stats`, { headers }),
        fetch(
          `${API_BASE}/api/admin/chats?page=${pageNum}&per_page=20`,
          { headers }
        ),
      ]);

      if (statsRes.ok) {
        const statsData: ChatStats = await statsRes.json();
        setStats(statsData);
      }

      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChats(chatsData.chats || []);
        setTotalPages(chatsData.total_pages || 1);
        setPage(pageNum);
      } else if (!statsRes.ok) {
        throw new Error(`${statsRes.status} ${statsRes.statusText}`);
      }
    } catch (err) {
      console.error("[Admin] Failed to fetch chat data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch chat data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summaryCards = [
    {
      label: "Total Chats",
      value: stats.total_chats,
      icon: MessageCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Chats",
      value: stats.active_chats,
      icon: MessageCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Inquiry Chats",
      value: stats.inquiry_chats,
      icon: MessageSquare,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Deal Chats",
      value: stats.deal_chats,
      icon: Handshake,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Chat Activity
          </h1>
          <p className="text-sm text-gray-500">
            Monitor chat counts and recent marketplace conversations
          </p>
        </div>
        <button
          onClick={() => fetchData(page)}
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
              Could not load chat data
            </p>
            <p className="text-xs text-amber-600">{error}</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
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
              <p className="text-xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block h-5 w-16 animate-pulse rounded bg-gray-100" />
                ) : (
                  card.value.toLocaleString()
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent chats table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Conversations
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-white border border-gray-100 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Type
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Participants
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                  Listing
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                  Messages
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : chats.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No recent chat activity found.
                  </td>
                </tr>
              ) : (
                chats.map((chat) => (
                  <tr
                    key={chat.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {chat.type === "deal" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-600">
                          <Handshake size={12} /> Deal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600">
                          <MessageSquare size={12} /> Inquiry
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 truncate max-w-[200px]">
                      {[chat.participant_1, chat.participant_2]
                        .filter(Boolean)
                        .join(" ↔ ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell truncate max-w-[180px]">
                      {chat.listing_title || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {chat.message_count ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {chat.last_message_at
                        ? new Date(chat.last_message_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchData(page - 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchData(page + 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
