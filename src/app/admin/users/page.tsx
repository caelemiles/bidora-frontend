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
  Eye,
  Filter,
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
  listings_count?: number;
  bids_count?: number;
  pass_strike_count?: number;
  temp_ban?: boolean;
  last_activity?: string;
}

interface ConfirmModal {
  type: "ban" | "unban" | "delete";
  user: AdminUser;
}

interface DetailModal {
  user: AdminUser;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ConfirmModal | null>(null);
  const [detailModal, setDetailModal] = useState<DetailModal | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(
    async (pageNum = 1, query = "", status = "") => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const params = new URLSearchParams({
          page: String(pageNum),
          per_page: "20",
        });
        if (query) params.set("search", query);
        if (status) params.set("status", status);

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
    fetchUsers(1, search, statusFilter);
  }

  function handleStatusFilterChange(status: string) {
    setStatusFilter(status);
    fetchUsers(1, search, status);
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
      fetchUsers(page, search, statusFilter);
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
      desc: "This will restore the user's access to Bidora.",
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
    <div className="p-4 lg:p-8 max-w-[1400px]">
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
          onClick={() => fetchUsers(page, search, statusFilter)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
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

        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
          >
            <option value="">All Users</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="onboarding_incomplete">Onboarding Incomplete</option>
          </select>
        </div>
      </div>

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
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                Onboarding
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                Joined
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">
                Listings
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">
                Bids
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">
                Strikes
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
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
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
                  colSpan={9}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  {search || statusFilter
                    ? "No users match your criteria."
                    : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 transition-colors ${
                    user.is_banned
                      ? "bg-red-50/40 hover:bg-red-50/60"
                      : "hover:bg-gray-50/50"
                  }`}
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
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {user.onboarding_completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                        <Check size={12} /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden xl:table-cell text-center">
                    {user.listings_count ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden xl:table-cell text-center">
                    {user.bids_count ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-center">
                    {(user.pass_strike_count ?? 0) > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        {user.pass_strike_count}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_banned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        <Ban size={12} /> Banned
                      </span>
                    ) : user.temp_ban ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        <Ban size={12} /> Temp Ban
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDetailModal({ user })}
                        className="rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
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
              onClick={() => fetchUsers(page - 1, search, statusFilter)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchUsers(page + 1, search, statusFilter)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* User detail modal */}
      {detailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setDetailModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              {detailModal.user.avatar_url ? (
                <img
                  src={detailModal.user.avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-400">
                  {(detailModal.user.display_name || "?")[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {detailModal.user.display_name || "—"}
                </p>
                <p className="text-sm text-gray-500">{detailModal.user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400">Status</p>
                <p className="text-sm font-semibold">
                  {detailModal.user.is_banned ? (
                    <span className="text-red-600">Banned</span>
                  ) : detailModal.user.temp_ban ? (
                    <span className="text-amber-600">Temporarily Banned</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Onboarding</p>
                <p className="text-sm font-semibold text-gray-900">
                  {detailModal.user.onboarding_completed ? "Completed" : "Incomplete"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Join Date</p>
                <p className="text-sm text-gray-700">
                  {new Date(detailModal.user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Last Activity</p>
                <p className="text-sm text-gray-700">
                  {detailModal.user.last_activity
                    ? new Date(detailModal.user.last_activity).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Listings</p>
                <p className="text-sm font-semibold text-gray-900">
                  {detailModal.user.listings_count ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Bids</p>
                <p className="text-sm font-semibold text-gray-900">
                  {detailModal.user.bids_count ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Pass Strikes</p>
                <p className={`text-sm font-semibold ${(detailModal.user.pass_strike_count ?? 0) > 0 ? "text-red-600" : "text-gray-900"}`}>
                  {detailModal.user.pass_strike_count ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              {detailModal.user.is_banned ? (
                <button
                  onClick={() => {
                    setDetailModal(null);
                    setModal({ type: "unban", user: detailModal.user });
                  }}
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
                >
                  Unban User
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDetailModal(null);
                    setModal({ type: "ban", user: detailModal.user });
                  }}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                >
                  Ban User
                </button>
              )}
              <button
                onClick={() => {
                  setDetailModal(null);
                  setModal({ type: "delete", user: detailModal.user });
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
              <button
                onClick={() => setDetailModal(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
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
