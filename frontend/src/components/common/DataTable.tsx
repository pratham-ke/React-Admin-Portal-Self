import React from "react";

export type ColumnConfig = {
  key: string;
  title: string;
  width?: string;
  render?: (row: any) => React.ReactNode;
  sortable?: boolean;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
};

type Props = {
  columns: ColumnConfig[];
  rows: any[];
  pagination?: Pagination;
  sortable?: boolean;
  loading?: boolean;
  onSortChange?: (key: string, direction: "asc" | "desc") => void;
};

const pageSizes = [10, 25, 50, 100];

const SortIcon: React.FC<{ dir?: "asc" | "desc" | undefined }> = ({ dir }) => (
  <span className="inline-block ml-2 text-xs">
    {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}
  </span>
);

const DataTable: React.FC<Props> = ({ columns, rows, pagination, sortable, loading, onSortChange }) => {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc" | null>(null);

  const handleHeaderClick = (col: ColumnConfig) => {
    if (!sortable || !col.sortable) return;
    let nextDir: "asc" | "desc" = "asc";
    if (sortKey === col.key && sortDir === "asc") nextDir = "desc";
    setSortKey(col.key);
    setSortDir(nextDir);
    onSortChange?.(col.key, nextDir);
  };

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-2 ${col.width ?? ""} cursor-pointer`} onClick={() => handleHeaderClick(col)}>
                <div className="flex items-center">
                  <span>{col.title}</span>
                  {col.sortable && <SortIcon dir={sortKey === col.key ? (sortDir ?? undefined) as any : undefined} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any, idx: number) => (
            <tr key={r.id ?? idx} className="border-t">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 align-top">
                  {col.render ? col.render(r) : (r[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && !loading && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={columns.length}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
      {loading && <div className="p-4 text-sm text-gray-600">Loading...</div>}

      {pagination && (
        <div className="flex items-center justify-between p-3 border-t">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))} disabled={pagination.page <= 1}>Prev</button>
            <span className="text-sm text-gray-600">Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}</span>
            <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => pagination.onPageChange(Math.min(Math.max(1, Math.ceil(pagination.total / pagination.pageSize)), pagination.page + 1))} disabled={pagination.page >= Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}>Next</button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select className="border rounded px-2 py-1" value={pagination.pageSize} onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}>
              {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
