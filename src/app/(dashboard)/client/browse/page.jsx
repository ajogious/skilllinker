"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/shared/Navbar";
import TradesmanCard from "@/components/shared/TradesmanCard";

const CATEGORIES = [
  "All",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Welding",
  "Tiling",
  "Roofing",
  "Masonry",
  "HVAC",
  "Landscaping",
  "Flooring",
  "Generator Repair",
  "Solar Installation",
];

export default function BrowsePage() {
  const [tradesmen, setTradesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    skill: "",
    location: "",
    sort: "rating",
    minRating: "",
    verifiedOnly: false,
  });
  const [locationInput, setLocationInput] = useState("");

  const fetchTradesmen = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(currentFilters.skill &&
          currentFilters.skill !== "All" && { skill: currentFilters.skill }),
        ...(currentFilters.location && { location: currentFilters.location }),
        ...(currentFilters.minRating && {
          minRating: currentFilters.minRating,
        }),
        ...(currentFilters.verifiedOnly && { verifiedOnly: "true" }),
        sort: currentFilters.sort,
        page: currentPage,
      });

      const res = await fetch(`/api/tradesman/browse?${params}`);
      const data = await res.json();
      setTradesmen(data.tradesmen || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTradesmen(filters, page);
  }, [filters, page, fetchTradesmen]);

  const handleLocationSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, location: locationInput }));
    setPage(1);
  };

  const handleCategoryClick = (cat) => {
    setFilters((f) => ({ ...f, skill: cat === "All" ? "" : cat }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      skill: "",
      location: "",
      sort: "rating",
      minRating: "",
      verifiedOnly: false,
    });
    setLocationInput("");
    setPage(1);
  };

  const hasActiveFilters =
    filters.skill ||
    filters.location ||
    filters.minRating ||
    filters.verifiedOnly;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Find Skilled Tradesmen
          </h1>
          <p className="text-slate-400 text-sm">
            Browse verified professionals ready to work
          </p>
        </div>

        {/* Search + Sort bar */}
        <form onSubmit={handleLocationSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Search by city or area (e.g. Lagos, Abuja)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <select
            value={filters.sort}
            onChange={(e) => {
              setFilters((f) => ({ ...f, sort: e.target.value }));
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm hidden sm:block"
          >
            <option value="rating">Top Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="newest">Newest</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all flex-shrink-0"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${
              hasActiveFilters
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        </form>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Min Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, minRating: e.target.value }));
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, sort: e.target.value }));
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="rating">Top Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Verified Only
              </label>
              <button
                type="button"
                onClick={() => {
                  setFilters((f) => ({ ...f, verifiedOnly: !f.verifiedOnly }));
                  setPage(1);
                }}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  filters.verifiedOnly
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {filters.verifiedOnly ? "✓ Verified Only" : "Show All"}
              </button>
            </div>
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CATEGORIES.map((cat) => {
            const isActive =
              cat === "All" ? !filters.skill : filters.skill === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-slate-900 text-slate-400 hover:text-white border-slate-700 hover:border-slate-600"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            {loading ? (
              "Searching..."
            ) : (
              <>
                <span className="text-white font-medium">{total}</span>{" "}
                tradesman{total !== 1 ? "s" : ""} found
                {filters.location && (
                  <>
                    {" "}
                    in <span className="text-white">{filters.location}</span>
                  </>
                )}
                {filters.skill && (
                  <>
                    {" "}
                    for <span className="text-white">{filters.skill}</span>
                  </>
                )}
              </>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
            >
              Clear all filters
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-3/4" />
                    <div className="h-2 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-2 bg-slate-800 rounded" />
                  <div className="h-2 bg-slate-800 rounded w-4/5" />
                </div>
                <div className="flex gap-1.5">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="h-5 w-16 bg-slate-800 rounded-full"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : tradesmen.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">
              No tradesmen found
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Try adjusting your filters or searching a different location
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear all filters →
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tradesmen.map((t) => (
                <TradesmanCard key={t.userId} tradesman={t} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 text-sm transition-all"
                >
                  ← Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === i + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 text-sm transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
