"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Ban,
  Trash2,
  RefreshCw,
  AlertTriangle,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  is_banned?: boolean;
  created_at: string;
  onboarding_completed?: boolean;
}

interface ConfirmModal {
  type: "ban" | "unban" | "delete";
  user: AdminUser;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ConfirmModal | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(
    async (pageNum = 1, query = "") => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const params = new URLSearchParams({
          page: String(pageNum),
          per_page: "20",
        });
        if (query) params.set("search", query);

        const res = await fetch(
          `${API_BASE}/api/admin/users?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.total_pages || 1);
        setPage(pageNum);
      } catch (err) {
        console.error("[Admin] Failed to fetch users:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch users"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchUsers(1, search);
  }

  async function handleAction() {
    if (!modal) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      let url = "";
      let method = "POST";

      switch (modal.type) {
        case "ban":
          url = `${API_BASE}/api/admin/users/${modal.user.id}/ban`;
          break;
        case "unban":
          url = `${API_BASE}/api/admin/users/${modal.user.id}/unban`;
          break;
        case "delete":
          url = `${API_BASE}/api/admin/users/${modal.user.id}`;
          method = "DELETE";
          break;
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message || body.error || `${res.status} ${res.statusText}`
        );
      }

      setModal(null);
      fetchUsers(page, search);
    } catch (err) {
      console.error(`[Admin] ${modal.type} user failed:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${modal.type} user`
      );
      setModal(null);
    } finally {
      setActionLoading(false);
    }
  }

  const modalLabels = {
    ban: {
      title: "Ban User",
      desc: "This will prevent the user from accessing Bidora. Are you sure?",
      confirm: "Ban User",
      color: "bg-amber-600 hover:bg-amber-700",
    },
    unban: {
      title: "Unban User",
      desc: "This will restore the user\u2019s access to Bidora.",
      confirm: "Unban User",
      color: "bg-green-600 hover:bg-green-700",
    },
    delete: {
      title: "Delete User",
      desc: "This will permanently delete this user account and all associated data. This action cannot be undone.",
      confirm: "Delete Permanently",
      color: "bg-red-600 hover:bg-red-700",
    },
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            User Management
          </h1>
          <p className="text-sm text-gray-500">
            View, search, ban, and manage user accounts
          </p>
        </div>
        <button
          onClick={() => fetchUsers(page, search)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="mb-5 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-gray-100 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 font-semibold text-gray-600">User</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                Joined
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100 ml-auto" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  {search ? "No users match your search." : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
                          {(user.display_name || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[140px]">
                        {user.display_name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell truncate max-w-[200px]">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_banned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        <Ban size={12} /> Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {user.is_banned ? (
                        <button
                          onClick={() =>
                            setModal({ type: "unban", user })
                          }
                          className="rounded-lg bg-green-50 p-1.5 text-green-600 hover:bg-green-100 transition-colors"
                          title="Unban user"
                        >
                          <Check size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setModal({ type: "ban", user })
                          }
                          className="rounded-lg bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 transition-colors"
                          title="Ban user"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setModal({ type: "delete", user })
                        }
                        className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
              onClick={() => fetchUsers(page - 1, search)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchUsers(page + 1, search)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {modalLabels[modal.type].title}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mb-2 text-sm text-gray-500">
              <strong>{modal.user.display_name || modal.user.email}</strong>
            </p>
            <p className="mb-6 text-sm text-gray-600">
              {modalLabels[modal.type].desc}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-50 ${modalLabels[modal.type].color}`}
              >
                {actionLoading
                  ? "Processing…"
                  : modalLabels[modal.type].confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
