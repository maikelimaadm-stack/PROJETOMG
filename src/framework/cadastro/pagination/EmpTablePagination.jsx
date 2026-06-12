import React, { useMemo } from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { MgNavSkipIcon, MgNavStepIcon } from "@/modules/empresas/layout/MgNavIcons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { EMP_TOOLBAR_BTN_SHAPE, EMP_TOOLBAR_FIELD_BORDER } from "@/framework/cadastro/toolbars/empToolbarStyles";

export const EMP_PAGE_SIZE_OPTIONS = [50, 100, 200, 500];

const PAGINATION_BTN_BASE =
  `emp-table-pagination-btn inline-flex shrink-0 items-center justify-center ${EMP_TOOLBAR_BTN_SHAPE} bg-white text-[12px] font-normal shadow-none hover:bg-[#f8f9fd] disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-0`;

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
    className={`${PAGINATION_BTN_BASE} h-[22px] min-h-[22px] max-h-[22px] ${active ? "emp-table-pagination-page-active text-white" : "text-[#0f172a]"} ${className}`}
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
  variant = "default",
}) {
  const isMg = variant === "mg";
  const safePage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const pageItems = useMemo(() => getVisiblePages(safePage, totalPages), [safePage, totalPages]);

  const FirstIcon = isMg ? () => <MgNavSkipIcon direction="left" /> : () => <ChevronsLeft className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />;
  const PrevIcon = isMg ? () => <MgNavStepIcon direction="left" /> : () => <ChevronLeft className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />;
  const NextIcon = isMg ? () => <MgNavStepIcon direction="right" /> : () => <ChevronRight className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />;
  const LastIcon = isMg ? () => <MgNavSkipIcon direction="right" /> : () => <ChevronsRight className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />;

  return (
    <div className="emp-table-pagination flex shrink-0 items-center justify-end gap-2 border-t border-[#e8ecef] bg-white px-2 py-1">
      <div className="flex shrink-0 items-center justify-end gap-1">
      <PaginationBtn onClick={() => onPageChange?.(1)} disabled={safePage <= 1} className="w-6 min-w-6 p-0" title="Primeira página" aria-label="Primeira página">
        <FirstIcon />
      </PaginationBtn>
      <PaginationBtn onClick={() => onPageChange?.(safePage - 1)} disabled={safePage <= 1} className="w-6 min-w-6 p-0" title="Página anterior" aria-label="Página anterior">
        <PrevIcon />
      </PaginationBtn>

      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="emp-table-pagination-ellipsis px-0.5 text-[11px] font-normal text-[#1a1f26] select-none leading-[22px]">
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
            className="min-w-[18px] px-1 text-[11px]"
          >
            {item}
          </PaginationBtn>
        )
      )}

      <PaginationBtn onClick={() => onPageChange?.(safePage + 1)} disabled={safePage >= totalPages} className="w-6 min-w-6 p-0" title="Próxima página" aria-label="Próxima página">
        <NextIcon />
      </PaginationBtn>
      <PaginationBtn onClick={() => onPageChange?.(totalPages)} disabled={safePage >= totalPages} className="w-6 min-w-6 p-0" title="Última página" aria-label="Última página">
        <LastIcon />
      </PaginationBtn>

      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange?.(Number(value))}>
        <SelectTrigger
          className={`emp-table-pagination-size h-[22px] min-h-[22px] max-h-[22px] w-[112px] shrink-0 ${EMP_TOOLBAR_FIELD_BORDER} bg-white px-2 text-[11px] font-normal text-[#1a1f26] shadow-none hover:bg-white focus:ring-1 focus:ring-sky-300`}
          aria-label="Registros por página"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[110px]">
          {EMP_PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)} className="text-xs">
              {size} por página
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      </div>
    </div>
  );
}
