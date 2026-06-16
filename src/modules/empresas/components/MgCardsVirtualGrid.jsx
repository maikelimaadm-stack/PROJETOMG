import React, { memo, useEffect } from "react";
import { Check } from "lucide-react";
import MgRecordFavoriteStar from "@/modules/empresas/layout/MgRecordFavoriteStar";
import {
  getEmpSearchAvatarColor,
  getEmpSearchFieldValue,
  getEmpSearchInitials,
} from "@/modules/empresas/components/empSearchView.constants";
import {
  CARDS_LIST_PADDING,
  useGridVirtualizer,
} from "@/shared/hooks/useGridVirtualizer";

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
  const layoutKey = `${cardsPerRow}:${fieldsPerRow}:${detailFields.map((field) => field.key).join(",")}`;

  const { virtualizer, virtualRows, totalSize } = useGridVirtualizer({
    scrollRef,
    itemCount: items.length,
    columnsPerRow: cardsPerRow,
    detailFieldCount: detailFields.length,
    fieldsPerRow,
    scrollMargin: CARDS_LIST_PADDING,
    enabled: items.length > 0,
  });

  useEffect(() => {
    if (!virtualizer) return;
    const frame = requestAnimationFrame(() => virtualizer.measure());
    return () => cancelAnimationFrame(frame);
  }, [virtualizer, items.length, layoutKey]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !virtualizer) return undefined;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => virtualizer.measure());
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(scrollEl);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [scrollRef, virtualizer]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    scrollEl.scrollTop = 0;
    virtualizer?.scrollToIndex?.(0, { align: "start" });
  }, [scrollResetKey, scrollRef, virtualizer]);

  useEffect(() => {
    if (!virtualizer || !activeSelectionId) return;
    const itemIndex = items.findIndex((item) => item?.id === activeSelectionId);
    if (itemIndex < 0) return;
    const rowIndex = Math.floor(itemIndex / Math.max(1, cardsPerRow));
    requestAnimationFrame(() => {
      virtualizer.scrollToIndex(rowIndex, { align: "auto" });
    });
  }, [virtualizer, activeSelectionId, items, cardsPerRow]);

  if (items.length === 0) return null;

  return (
    <div
      className="mg-cards-virtual-shell"
      style={{
        height: totalSize + CARDS_LIST_PADDING * 2,
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
        left: CARDS_LIST_PADDING,
        width: `calc(100% - ${CARDS_LIST_PADDING * 2}px)`,
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start + CARDS_LIST_PADDING}px)`,
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
                {detailFields.map((field) => (
                  <div key={field.key} className="mg-emp-card__field">
                    <div className="mg-emp-card__field-line">
                      <span className="mg-emp-card__field-label">{field.label}:</span>
                      <span
                        className={`mg-emp-card__field-value${field.align ? ` mg-emp-card__field-value--align-${field.align}` : ""}`}
                      >
                        {getEmpSearchFieldValue(emp, field.key)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});

export default memo(MgCardsVirtualGrid);
