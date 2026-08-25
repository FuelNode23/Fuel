import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

/**
 * Client-side search + pagination over an already-fetched array. Both
 * admin tabs fetch their full list in one call - there's no backend
 * pagination to hook into, and at this data scale (dozens to low
 * hundreds of rows) a server round-trip per page/search keystroke would
 * be more machinery than the problem needs.
 *
 * @param {any[]} items
 * @param {(item: any, query: string) => boolean} matches - query is already trimmed/lowercased
 */
export function useSearchAndPaginate(items, matches) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => matches(item, q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);

  // A new search (or the underlying list changing shape, e.g. after a
  // delete) can leave `page` pointing past the end - reset rather than
  // land on a page that's suddenly empty.
  useEffect(() => {
    setPage(1);
  }, [query, items.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return {
    query,
    setQuery,
    page: currentPage,
    setPage,
    totalPages,
    pageItems,
    totalResults: filtered.length,
  };
}
