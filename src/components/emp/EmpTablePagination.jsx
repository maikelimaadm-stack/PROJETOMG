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

const NavIconBtn = ({ children, disabled, ...props }) => (
  <button
    type="button"
    className="emp-table-pagination-nav inline-flex h-6 w-6 shrink-0 items-center justify-center border-0 bg-transparent p-0 shadow-none transition-colors focus-visible:outline-none disabled:pointer-events-none"
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const PageBtn = ({ page, active, onClick }) => (
  <button
    type="button"
    className={
      active
        ? "emp-table-pagination-page-active inline-flex h-6 min-w-[26px] items-center justify-center rounded-[5px] border bg-transparent px-1.5 text-[12px] font-medium leading-none transition-colors focus-visible:outline-none"
        : "emp-table-pagination-page inline-flex h-6 min-w-[22px] items-center justify-center border-0 bg-transparent px-0.5 text-[12px] font-medium leading-none transition-colors hover:opacity-80 focus-visible:outline-none"
    }
    onClick={onClick}
    title={`Página ${page}`}
    aria-label={`Página ${page}`}
    aria-current={active ? "page" : undefined}
  >
    {page}
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
    <div className="emp-table-pagination flex shrink-0 items-center justify-end gap-2 border-t border-sky-100 bg-white px-2 py-1.5">
      <NavIconBtn onClick={() => onPageChange?.(1)} disabled={safePage <= 1} title="Primeira página" aria-label="Primeira página">
        <ChevronsLeft className="emp-table-pagination-nav-icon h-3.5 w-3.5" />
      </NavIconBtn>
      <NavIconBtn onClick={() => onPageChange?.(safePage - 1)} disabled={safePage <= 1} title="Página anterior" aria-label="Página anterior">
        <ChevronLeft className="emp-table-pagination-nav-icon h-3.5 w-3.5" />
      </NavIconBtn>

      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="emp-table-pagination-ellipsis px-0.5 text-[12px] font-medium select-none">
            ...
          </span>
        ) : (
          <PageBtn
            key={item}
            page={item}
            active={item === safePage}
            onClick={() => onPageChange?.(item)}
          />
        )
      )}

      <NavIconBtn onClick={() => onPageChange?.(safePage + 1)} disabled={safePage >= totalPages} title="Próxima página" aria-label="Próxima página">
        <ChevronRight className="emp-table-pagination-nav-icon h-3.5 w-3.5" />
      </NavIconBtn>
      <NavIconBtn onClick={() => onPageChange?.(totalPages)} disabled={safePage >= totalPages} title="Última página" aria-label="Última página">
        <ChevronsRight className="emp-table-pagination-nav-icon h-3.5 w-3.5" />
      </NavIconBtn>

      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange?.(Number(value))}>
        <SelectTrigger
          className={`emp-table-pagination-size h-[22px] w-[118px] shrink-0 ${EMP_TOOLBAR_BORDER} bg-white px-2 text-[11px] font-medium text-[#5b6b80] shadow-none hover:bg-sky-50 focus:ring-1 focus:ring-sky-300`}
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
