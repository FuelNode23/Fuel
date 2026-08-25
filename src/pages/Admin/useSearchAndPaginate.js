import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

function compareValues(a, b) {
  // Nulls always sort last, in both directions - otherwise reversing the
  // sort would make every "no value" row jump to the top, which reads as
  // more important than it is.
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  // ISO 8601 timestamps (createdAt/lastLoginAt) sort correctly as plain
  // strings - lexicographic order already matches chronological order,
  // so no separate Date-parsing path is needed for them.
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

/**
 * Client-side search + sort + pagination over an already-fetched array.
 * Both admin tabs fetch their full list in one call - there's no backend
 * pagination/sorting to hook into, and at this data scale (dozens to low
 * hundreds of rows) a server round-trip per page/search/sort click would
 * be more machinery than the problem needs.
 *
 * @param {any[]} items
 * @param {(item: any, query: string) => boolean} matches - query is already trimmed/lowercased
 * @param {(item: any, sortKey: string) => (string|number|null)} getSortValue
 */
export function useSearchAndPaginate(items, matches, getSortValue) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  // No default sort key - leaves the backend's own order (e.g. brand+name
  // for products, createdAt for users) exactly as-is until an admin
  // actually clicks a column header.
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => matches(item, q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const cmp = compareValues(getSortValue(a, sortKey), getSortValue(b, sortKey));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir]);

  // A new search (or the underlying list changing shape, e.g. after a
  // delete) can leave `page` pointing past the end - reset rather than
  // land on a page that's suddenly empty.
  useEffect(() => {
    setPage(1);
  }, [query, items.length]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return {
    query,
    setQuery,
    page: currentPage,
    setPage,
    totalPages,
    pageItems,
    totalResults: sorted.length,
    sortKey,
    sortDir,
    toggleSort,
  };
}
