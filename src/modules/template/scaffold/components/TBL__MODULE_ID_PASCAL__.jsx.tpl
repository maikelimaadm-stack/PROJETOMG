import React, { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import EmpTablePagination from "@/framework/cadastro/pagination/EmpTablePagination";
import { useQuery } from "@tanstack/react-query";
import __REPOSITORY_NAME__ from "@/modules/__MODULE_ID__/repositories/__REPOSITORY_NAME__";
import campoEngine from "@/framework/cadastro/fields/campoEngine";

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
  const { data: camposPersonalizados = [] } = useQuery({
    queryKey: ["__MODULE_ID__", "campos"],
    queryFn: () => __REPOSITORY_NAME__.listCamposPersonalizados(),
    initialData: [],
  });

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const dynamicColumns = useMemo(
    () =>
      camposPersonalizados
        .map(campoEngine.normalize)
        .filter((campo) => campo.ativo !== false && campo.visivel_tabela === true)
        .map((campo) => ({
          id: `custom:${campo.field_name}`,
          label: campo.label || campo.field_name,
          customField: campo.field_name,
        })),
    [camposPersonalizados]
  );

  const columns = useMemo(
    () => [
      { id: "codempresa", label: "Código Empresa" },
      { id: "nome_empresa", label: "Empresa" },
      { id: "nome", label: "Nome" },
      { id: "status", label: "Status" },
      ...dynamicColumns,
    ],
    [dynamicColumns]
  );

  const rows = useMemo(
    () =>
      items.map((item) =>
        columns.map((column) => {
          if (column.id === "codempresa") return item.codempresa || "-";
          if (column.id === "nome_empresa") return item.nome_empresa || "-";
          if (column.id === "nome") return item.nome || "-";
          if (column.id === "status") return item.status || "-";
          if (column.customField) {
            return item.campos_personalizados?.[column.customField] ?? "-";
          }
          return "-";
        })
      ),
    [items, columns]
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
                <TableCell>{item.codempresa || "-"}</TableCell>
                <TableCell>{item.nome_empresa || "-"}</TableCell>
                <TableCell>{item.nome || "-"}</TableCell>
                <TableCell>{item.status || "-"}</TableCell>
                {dynamicColumns.map((column) => (
                  <TableCell key={column.id}>
                    {item.campos_personalizados?.[column.customField] ?? "-"}
                  </TableCell>
                ))}
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

