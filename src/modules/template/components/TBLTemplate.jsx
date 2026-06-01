import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import EmpTablePagination from "@/framework/cadastro/pagination/EmpTablePagination";

export default function TBLTemplate({
  items = [],
  page = 1,
  pageSize = 50,
  total = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id || item.codigo}>
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

