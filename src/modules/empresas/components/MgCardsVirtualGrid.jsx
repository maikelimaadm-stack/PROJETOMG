import React, { memo, useLayoutEffect, useRef } from "react";
import { Check } from "lucide-react";
import MgRecordFavoriteStar from "@/modules/empresas/layout/MgRecordFavoriteStar";
import {
  getEmpSearchAvatarColor,
  getEmpSearchFieldValue,
  getEmpSearchInitials,
} from "@/modules/empresas/components/empSearchView.constants";
import {
  CARD_GRID_GAP,
  CARDS_TOP_PADDING,
  estimateCardRowHeight,
  useGridVirtualizer,
} from "@/shared/hooks/useGridVirtualizer";
import {
  resolveSelectionScrollDirection,
  scrollVirtualRowIntoView,
} from "@/shared/utils/virtualScrollIntoView";

function MgCardsVirtualGrid({
  scrollRef,
  items,
  cardsPerRow,
  fieldsPerRow,
  detailFields,
  selectedIds,
  isFavoriteRecord,
  onToggleFavorite,
  onCardClick,
  activeSelectionId = null,
  scrollResetKey = "",
}) {
  const skipInitialSelectionScrollRef = useRef(true);
  const previousSelectionIndexRef = useRef(null);
  const fixedRowHeight = estimateCardRowHeight(detailFields.length, fieldsPerRow);

  const { virtualizer, virtualRows, totalSize } = useGridVirtualizer({
    scrollRef,
    itemCount: items.length,
    columnsPerRow: cardsPerRow,
    estimateRowHeight: fixedRowHeight,
    enabled: items.length > 0,
    scrollMargin: CARDS_TOP_PADDING,
  });

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return undefined;

    const resetScrollTop = () => {
      scrollEl.scrollTop = 0;
    };

    resetScrollTop();
    skipInitialSelectionScrollRef.current = true;
    previousSelectionIndexRef.current = null;

    const frameId = requestAnimationFrame(() => {
      resetScrollTop();
    });

    return () => cancelAnimationFrame(frameId);
  }, [scrollResetKey, scrollRef]);

  useLayoutEffect(() => {
    if (skipInitialSelectionScrollRef.current) {
      skipInitialSelectionScrollRef.current = false;
      if (activeSelectionId) {
        previousSelectionIndexRef.current = items.findIndex((item) => item?.id === activeSelectionId);
      }
      return;
    }
    if (!virtualizer || !activeSelectionId) return;

    const itemIndex = items.findIndex((item) => item?.id === activeSelectionId);
    if (itemIndex < 0) return;

    const previousIndex = previousSelectionIndexRef.current;
    previousSelectionIndexRef.current = itemIndex;

    const direction = resolveSelectionScrollDirection(previousIndex, itemIndex);
    if (!direction) return;

    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const rowIndex = Math.floor(itemIndex / Math.max(1, cardsPerRow));
    scrollVirtualRowIntoView(scrollEl, rowIndex, {
      itemSize: fixedRowHeight + CARD_GRID_GAP,
      rowSize: fixedRowHeight,
      scrollOffset: CARDS_TOP_PADDING,
      direction,
    });
  }, [activeSelectionId, items, cardsPerRow, fixedRowHeight, scrollRef]);

  if (items.length === 0) return null;

  return (
    <div
      className="mg-cards-virtual-shell"
      style={{
        "--mg-card-row-height": `${fixedRowHeight}px`,
        height: totalSize + CARDS_TOP_PADDING,
        position: "relative",
        width: "100%",
      }}
    >
      {virtualRows.map((virtualRow) => (
        <MgCardsVirtualRow
          key={virtualRow.key}
          virtualRow={virtualRow}
          items={items}
          cardsPerRow={cardsPerRow}
          fieldsPerRow={fieldsPerRow}
          detailFields={detailFields}
          selectedIds={selectedIds}
          isFavoriteRecord={isFavoriteRecord}
          onToggleFavorite={onToggleFavorite}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

const MgCardsVirtualRow = memo(function MgCardsVirtualRow({
  virtualRow,
  items,
  cardsPerRow,
  fieldsPerRow,
  detailFields,
  selectedIds,
  isFavoriteRecord,
  onToggleFavorite,
  onCardClick,
}) {
  const startIndex = virtualRow.index * cardsPerRow;

  return (
    <div
      data-index={virtualRow.index}
      className={`mg-cards-virtual-row mg-cards-grid mg-cards-grid--cards-${cardsPerRow}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start + CARDS_TOP_PADDING}px)`,
      }}
    >
      {Array.from({ length: Math.min(cardsPerRow, items.length - startIndex) }, (_, colIndex) => {
        const emp = items[startIndex + colIndex];
        if (!emp) return null;
        const index = startIndex + colIndex;
        const isSelected = selectedIds.includes(emp.id);
        const code = getEmpSearchFieldValue(emp, "codempresa");
        const nome = getEmpSearchFieldValue(emp, "razao_social");
        const initials = getEmpSearchInitials(emp);
        const avatarColor = getEmpSearchAvatarColor(emp, index);
        const isFavorite = isFavoriteRecord?.(emp.id) ?? false;

        return (
          <div
            key={emp.id}
            data-emp-id={emp.id}
            className={`erp-card mg-emp-card mg-emp-card--virtual relative${isSelected ? " mg-emp-card--selected" : ""}`}
            onClick={(event) => onCardClick(emp, event)}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onCardClick(emp, event);
              }
            }}
          >
            {isSelected ? (
              <span className="mg-emp-card__select-badge" aria-hidden="true">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
            ) : null}
            <div className="mg-emp-card__header flex items-center gap-2.5">
              <div
                className="mg-emp-card__avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-bold tracking-tight text-white"
                style={{ background: avatarColor }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mg-emp-card__meta-row truncate text-xs">
                  <MgRecordFavoriteStar
                    active={isFavorite}
                    onToggle={() => onToggleFavorite?.(emp.id)}
                    className="mg-emp-card__fav-btn"
                  />
                  <div className="mg-emp-card__meta-text min-w-0 truncate">
                    {code && code !== "—" ? (
                      <>
                        <span className="mg-emp-card__code">{code}</span>
                        <span className="mg-emp-card__sep"> • </span>
                      </>
                    ) : null}
                    <span className="mg-emp-card__name">{nome}</span>
                  </div>
                </div>
              </div>
            </div>
            {detailFields.length > 0 ? (
              <div className={`mg-emp-card__fields mg-emp-card__fields--per-row-${fieldsPerRow}`}>
                {detailFields.map((field) => {
                  const fieldValue = getEmpSearchFieldValue(emp, field.key);
                  return (
                  <div
                    key={field.key}
                    className={`mg-emp-card__field${field.key === "id_global" ? " mg-emp-card__field--id-global" : ""}`}
                  >
                    <div className="mg-emp-card__field-line">
                      <span className="mg-emp-card__field-label">{field.label}:</span>
                      <span
                        className={`mg-emp-card__field-value${field.align ? ` mg-emp-card__field-value--align-${field.align}` : ""}`}
                        title={String(fieldValue ?? "")}
                      >
                        {fieldValue}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});

export default memo(MgCardsVirtualGrid);
