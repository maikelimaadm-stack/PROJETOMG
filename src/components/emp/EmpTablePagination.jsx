import React, { useMemo } from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMP_TOOLBAR_BORDER } from "@/components/emp/toolbars/empToolbarStyles";

export const EMP_PAGE_SIZE_OPTIONS = [50, 100, 200, 500];

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = new Set([1, totalPages]);
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push("ellipsis");
    items.push(page);
  });
  return items;
};

const PaginationBtn = ({ children, className = "", active = false, ...props }) => (
  <button
    type="button"
    className={`emp-toolbar-btn emp-table-pagination-btn inline-flex h-7 min-w-7 shrink-0 items-center justify-center ${EMP_TOOLBAR_BORDER} bg-white text-[11px] font-medium text-[#082e54] shadow-none hover:bg-sky-50 disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300 ${active ? "emp-table-pagination-btn-active" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function EmpTablePagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
}) {
  const safePage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const pageItems = useMemo(() => getVisiblePages(safePage, totalPages), [safePage, totalPages]);

  return (
    <div className="emp-table-pagination flex shrink-0 items-center justify-end gap-1.5 border-t border-sky-100 bg-white px-2 py-1.5">
      <PaginationBtn onClick={() => onPageChange?.(1)} disabled={safePage <= 1} title="Primeira página" aria-label="Primeira página">
        <ChevronsLeft className="w-3.5 h-3.5" />
      </PaginationBtn>
      <PaginationBtn onClick={() => onPageChange?.(safePage - 1)} disabled={safePage <= 1} title="Página anterior" aria-label="Página anterior">
        <ChevronLeft className="w-3.5 h-3.5" />
      </PaginationBtn>

      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-0.5 text-[11px] font-medium text-[#082e54] select-none">
            ...
          </span>
        ) : (
          <PaginationBtn
            key={item}
            active={item === safePage}
            onClick={() => onPageChange?.(item)}
            title={`Página ${item}`}
            aria-label={`Página ${item}`}
            aria-current={item === safePage ? "page" : undefined}
            className="emp-table-pagination-page min-w-[28px] px-1.5"
          >
            {item}
          </PaginationBtn>
        )
      )}

      <PaginationBtn onClick={() => onPageChange?.(safePage + 1)} disabled={safePage >= totalPages} title="Próxima página" aria-label="Próxima página">
        <ChevronRight className="w-3.5 h-3.5" />
      </PaginationBtn>
      <PaginationBtn onClick={() => onPageChange?.(totalPages)} disabled={safePage >= totalPages} title="Última página" aria-label="Última página">
        <ChevronsRight className="w-3 h-3" />
      </PaginationBtn>

      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange?.(Number(value))}>
        <SelectTrigger
          className={`emp-table-pagination-size h-7 w-[118px] shrink-0 ${EMP_TOOLBAR_BORDER} bg-white px-2 text-[11px] font-medium text-[#082e54] shadow-none hover:bg-sky-50 focus:ring-1 focus:ring-sky-300`}
          aria-label="Registros por página"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[118px]">
          {EMP_PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)} className="text-xs">
              {size} por página
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
