export default function SortableHeader({ column, sortKey, sortDir, onSort, children }) {
  const active = sortKey === column;
  return (
    <th
      className={`admin-table__sortable-th${active ? " admin-table__sortable-th--active" : ""}`}
      onClick={() => onSort(column)}
    >
      {children}
      <span className="admin-table__sort-icon" aria-hidden="true">
        {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </th>
  );
}
