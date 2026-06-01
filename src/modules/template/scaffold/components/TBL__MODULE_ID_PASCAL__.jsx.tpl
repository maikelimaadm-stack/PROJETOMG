import React, { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import EmpTablePagination from "@/framework/cadastro/pagination/EmpTablePagination";

export default function TBL__MODULE_ID_PASCAL__({
  items = [],
  onEdit,
  onVisibleDataChange,
  onSelectionChange,
  page = 1,
  pageSize = 50,
  total = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const rows = useMemo(
    () => items.map((item) => [item.codigo || item.id || "-", item.nome || "-", item.status || "-"]),
    [items]
  );

  const columns = useMemo(
    () => [
      { id: "codigo", label: "Código" },
      { id: "nome", label: "Nome" },
      { id: "status", label: "Status" },
    ],
    []
  );

  useEffect(() => {
    onVisibleDataChange?.({ columns, rows, allColumns: columns, allRows: rows, selectedRows: [] });
  }, [columns, rows, onVisibleDataChange]);

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className={selectedId === item.id ? "bg-sky-50" : ""}
                onClick={() => {
                  setSelectedId(item.id);
                  onSelectionChange?.([item.id]);
                }}
                onDoubleClick={() => onEdit?.(item)}
              >
                <TableCell>{item.codigo || item.id || "-"}</TableCell>
                <TableCell>{item.nome || "-"}</TableCell>
                <TableCell>{item.status || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <EmpTablePagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

