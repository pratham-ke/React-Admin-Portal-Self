import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchContacts } from "../../store/slices/contactSlice";
import DataTable, { type ColumnConfig } from "../../components/common/DataTable";

const ContactPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, total } = useAppSelector((s) => (s as any).contacts);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    dispatch(fetchContacts({ page, limit: pageSize, sortBy: sortBy ?? undefined, sortOrder: sortDir ?? undefined } as any));
  }, [dispatch, page, pageSize, sortBy, sortDir]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Contact Submissions</h1>
      </div>

  <DataTable
        columns={[
          { key: "name", title: "Name", render: (s) => `${s.firstName} ${s.lastName}`, sortable: true },
          { key: "email", title: "Email", sortable: true },
          { key: "phone", title: "Phone" },
          { key: "message", title: "Message", render: (s) => s.message?.slice(0, 80) ?? "" },
          { key: "submittedAt", title: "Submitted At", sortable: true, render: (s) => s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "-" }
        ] as ColumnConfig[]}
  rows={items}
  pagination={{ page, pageSize, total: total ?? (items as any).length ?? 0, onPageChange: (p) => setPage(p), onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
  sortable
  loading={loading}
  sortBy={sortBy}
  sortDir={sortDir}
  onSortChange={(k, d) => { setSortBy(k); setSortDir(d); }}
      />
    </div>
  );
};

export default ContactPage;


