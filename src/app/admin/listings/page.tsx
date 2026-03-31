"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Trash2,
  RefreshCw,
  AlertTriangle,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AdminListing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  current_bid?: number;
  category?: string;
  image_url?: string;
  status: string;
  seller_name?: string;
  seller_email?: string;
  created_at: string;
  bid_count?: number;
}

interface ConfirmModal {
  type: "delete" | "view";
  listing: AdminListing;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ConfirmModal | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = useCallback(
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
          `${API_BASE}/api/admin/listings?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setListings(data.listings || []);
        setTotalPages(data.total_pages || 1);
        setPage(pageNum);
      } catch (err) {
        console.error("[Admin] Failed to fetch listings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch listings"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchListings(1, search, statusFilter);
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
    fetchListings(1, search, status);
  }

  async function handleDelete() {
    if (!modal || modal.type !== "delete") return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${API_BASE}/api/admin/listings/${modal.listing.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message || body.error || `${res.status} ${res.statusText}`
        );
      }
      setModal(null);
      fetchListings(page, search, statusFilter);
    } catch (err) {
      console.error("[Admin] Delete listing failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete listing"
      );
      setModal(null);
    } finally {
      setActionLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-600",
    completed: "bg-blue-50 text-blue-600",
    awaiting_confirmation: "bg-amber-50 text-amber-600",
    expired: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-50 text-red-600",
    failed: "bg-red-50 text-red-500",
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Listing Management
          </h1>
          <p className="text-sm text-gray-500">
            Review, moderate, and manage marketplace listings
          </p>
        </div>
        <button
          onClick={() => fetchListings(page, search, statusFilter)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or seller…"
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

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="awaiting_confirmation">Awaiting Confirmation</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled / Failed</option>
        </select>
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
              <th className="px-4 py-3 font-semibold text-gray-600">
                Listing
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                Seller
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                Price
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">
                Current Bid
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">
                Category
              </th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                Created
              </th>
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
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-100 ml-auto" />
                  </td>
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  {search || statusFilter
                    ? "No listings match your criteria."
                    : "No listings found."}
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100" />
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[180px]">
                        {listing.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell truncate max-w-[160px]">
                    {listing.seller_name || listing.seller_email || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {listing.price != null ? `$${listing.price.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">
                    {listing.current_bid != null ? `$${listing.current_bid.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden xl:table-cell capitalize">
                    {listing.category || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        statusColors[listing.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          setModal({ type: "view", listing })
                        }
                        className="rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setModal({ type: "delete", listing })
                        }
                        className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete listing"
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
              onClick={() => fetchListings(page - 1, search, statusFilter)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchListings(page + 1, search, statusFilter)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* View details modal */}
      {modal?.type === "view" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Listing Details
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {modal.listing.image_url && (
              <img
                src={modal.listing.image_url}
                alt={modal.listing.title}
                className="mb-4 w-full rounded-xl object-cover max-h-48"
              />
            )}

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-400">Title</p>
                <p className="text-sm font-semibold text-gray-900">
                  {modal.listing.title}
                </p>
              </div>
              {modal.listing.description && (
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Description
                  </p>
                  <p className="text-sm text-gray-700">
                    {modal.listing.description}
                  </p>
                </div>
              )}
              <div className="flex gap-6 flex-wrap">
                <div>
                  <p className="text-xs font-medium text-gray-400">Price</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {modal.listing.price != null
                      ? `$${modal.listing.price.toFixed(2)}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Current Bid</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {modal.listing.current_bid != null
                      ? `$${modal.listing.current_bid.toFixed(2)}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Status</p>
                  <p className="text-sm font-medium capitalize text-gray-900">
                    {modal.listing.status}
                  </p>
                </div>
                {modal.listing.bid_count != null && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">Bids</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {modal.listing.bid_count}
                    </p>
                  </div>
                )}
                {modal.listing.category && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">Category</p>
                    <p className="text-sm font-medium capitalize text-gray-900">
                      {modal.listing.category}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Seller</p>
                <p className="text-sm text-gray-700">
                  {modal.listing.seller_name || modal.listing.seller_email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Created</p>
                <p className="text-sm text-gray-700">
                  {new Date(modal.listing.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {modal?.type === "delete" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Delete Listing
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              &quot;{modal.listing.title}&quot;
            </p>
            <p className="mb-6 text-sm text-gray-600">
              This will permanently remove this listing and all associated bids.
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-opacity disabled:opacity-50"
              >
                {actionLoading ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
