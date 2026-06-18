import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SkipBack,
  SkipForward,
  X,
  RotateCcw,
} from "lucide-react";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import {
  EMP_CONFIG_DIALOG_CLOSE_BUTTON,
  EMP_CONFIG_DIALOG_HEADER,
  EMP_CONFIG_DIALOG_CONTENT,
  EMP_CONFIG_DIALOG_FOOTER,
  EMP_CONFIG_DIALOG_LIST_DIALOG,
  EMP_CONFIG_DIALOG_SHELL,
  EMP_CONFIG_DIALOG_TABLE_SHELL,
  EMP_CONFIG_DIALOG_TABLE_SHELL_WITH_FOOTER,
  EMP_CONFIG_DIALOG_TABLE_WRAP,
  EMP_CONFIG_DIALOG_TOOLBAR,
  EMP_CONFIG_DIALOG_TRANSFER_DIALOG,
} from "@/framework/cadastro/styles/empConfigDialogStyles";

export const EmpConfigToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`ios-btn tb-btn tb-btn-ghost tb-btn-labeled ${className}`} {...props}>
    {children}
  </button>
);

export const EmpConfigRestoreBtn = ({ children, className = "", ...props }) => (
  <button
    type="button"
    className={`ios-btn tb-btn tb-btn-ghost tb-btn-icon emp-config-restore-btn ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const EmpConfigPrimaryBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`ios-btn tb-btn tb-btn-green tb-btn-labeled ${className}`} {...props}>
    {children}
  </button>
);

export const EmpConfigPrimaryIconBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`ios-btn tb-btn tb-btn-green tb-btn-icon ${className}`} {...props}>
    {children}
  </button>
);

export const EmpConfigMoveBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`ios-btn mg-nav-btn emp-config-transfer-btn ${className}`} {...props}>
    {children}
  </button>
);

export const EmpConfigSearchField = ({
  value,
  onChange,
  placeholder = "Procurar",
  className = "",
}) => (
  <div className={`emp-config-transfer-search mg-search-pill mg-search-pill--compact ${className}`}>
    <Search className="mg-search-pill-icon" strokeWidth={2.2} aria-hidden="true" />
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  </div>
);

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export function EmpConfigDialogFrame({
  open,
  onOpenChange,
  onRequestClose,
  title,
  badgeLabel,
  infoTitle,
  dialogClassName = "",
  onRestoreDefault = null,
  toolbar,
  footer,
  children,
}) {
  const handleClose = () => {
    if (onRequestClose) {
      onRequestClose();
      return;
    }
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen && onOpenChange?.(nextOpen)}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className={`${EMP_CONFIG_DIALOG_CONTENT} ${dialogClassName}`}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className={EMP_CONFIG_DIALOG_SHELL}>
          <div className={EMP_CONFIG_DIALOG_HEADER}>
            <div className="emp-config-dialog-header__title flex min-w-0 flex-1 items-center gap-1.5">
              <span className="emp-config-dialog-header__badge">{titleCase(badgeLabel)}</span>
              <ChevronRight
                className="emp-config-dialog-header__chevron h-3 w-3 shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="emp-config-dialog-header__name min-w-0 truncate">{infoTitle}</span>
            </div>
            <div className="emp-config-dialog-header__actions flex shrink-0 items-center gap-1">
              {onRestoreDefault ? (
                <EmpConfigRestoreBtn
                  onClick={onRestoreDefault}
                  title="Restaurar padrão"
                  aria-label="Restaurar padrão"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.2} />
                </EmpConfigRestoreBtn>
              ) : null}
              <button
                type="button"
                onClick={handleClose}
                className={`${EMP_CONFIG_DIALOG_CLOSE_BUTTON} ios-btn mg-nav-btn emp-config-dialog-close`}
                title="Fechar"
                aria-label="Fechar"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.25} />
              </button>
            </div>
          </div>

          <EmpSplitToolbarLayout toolbar={toolbar ? <div className={EMP_CONFIG_DIALOG_TOOLBAR}>{toolbar}</div> : null}>
            {children}
          </EmpSplitToolbarLayout>

          {footer ? <div className={EMP_CONFIG_DIALOG_FOOTER}>{footer}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EmpConfigTransferPanel({
  availableLabel = "Disponíveis",
  usedLabel = "Em uso",
  usedCountLabel = "itens",
  availableItems = [],
  usedItems = [],
  allAvailableItems = [],
  allUsedItems = [],
  selectedAvailableIds = [],
  selectedUsedIds = [],
  search = "",
  searchUsed = "",
  onSearchChange,
  onSearchUsedChange,
  searchPlaceholder = "Procurar",
  searchUsedPlaceholder = "Procurar em uso",
  onSelectAvailable,
  onSelectUsed,
  onAddSelected,
  onAddAll,
  onRemoveSelected,
  onRemoveAll,
  onDropToAvailable,
  onDropToUsed,
  draggedItemId = null,
  onStartDrag,
  onFinishDrag,
  onReorderUsedByDrop,
  renderUsedItemExtra,
  footer = null,
  emptyAvailableMessage = "Nenhum item disponível.",
  emptyUsedMessage = "Nenhum item em uso encontrado.",
}) {
  const renderItemButton = ({ item, selected, onClick, subtitle, index, origem }) => (
    <button
      key={item.id}
      type="button"
      draggable
      onClick={onClick}
      onDragStart={() => onStartDrag?.(item.id, origem)}
      onDragOver={(event) => {
        event.preventDefault();
        if (origem === "used") onReorderUsedByDrop?.(item.id);
      }}
      onDrop={onFinishDrag}
      onDragEnd={onFinishDrag}
      className={`emp-config-transfer-border-b emp-config-transfer-item relative flex h-[26px] w-full items-center gap-2 px-1 text-left text-xs last:border-b-0 transition-colors hover:brightness-[0.98] ${
        selected ? "emp-config-transfer-item--selected" : ""
      } ${draggedItemId === item.id ? "opacity-50" : ""}`}
    >
      {index !== undefined ? (
        <span className="emp-config-transfer-index">{index + 1}</span>
      ) : null}
      {index !== undefined && renderUsedItemExtra
        ? renderUsedItemExtra(item, index)
        : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <span className="emp-config-transfer-subtitle shrink-0">{subtitle}</span>
    </button>
  );

  return (
    <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
      <div
        className={
          footer ? EMP_CONFIG_DIALOG_TABLE_SHELL_WITH_FOOTER : EMP_CONFIG_DIALOG_TABLE_SHELL
        }
      >
        <div className="emp-config-transfer-grid">
            <aside
              className="emp-config-transfer-panel overflow-hidden flex flex-col"
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDropToAvailable}
            >
              <div className="emp-config-transfer-border-b emp-config-transfer-panel__title">
                {availableLabel}
              </div>
              <div className="emp-config-transfer-border-b emp-config-transfer-panel__search">
                <EmpConfigSearchField
                  value={search}
                  onChange={onSearchChange}
                  placeholder={searchPlaceholder}
                />
              </div>
              <div className="emp-config-transfer-panel__list flex-1 overflow-auto">
                {availableItems.length === 0 ? (
                  <div className="emp-config-transfer-empty">{emptyAvailableMessage}</div>
                ) : (
                  availableItems.map((item) =>
                    renderItemButton({
                      item,
                      selected: selectedAvailableIds.includes(item.id),
                      onClick: (event) => onSelectAvailable?.(item.id, event),
                      subtitle: "Disponível",
                      origem: "available",
                    })
                  )
                )}
              </div>
            </aside>

            <section className="emp-config-transfer-controls emp-config-transfer-border-x flex flex-col items-center justify-center gap-1">
              <EmpConfigMoveBtn
                disabled={allUsedItems.length === 0}
                onClick={onRemoveAll}
                title="Remover todos"
              >
                <SkipBack className="h-3 w-3" />
              </EmpConfigMoveBtn>
              <EmpConfigMoveBtn
                disabled={selectedUsedIds.length === 0}
                onClick={onRemoveSelected}
                title="Remover selecionados"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </EmpConfigMoveBtn>
              <EmpConfigMoveBtn
                disabled={selectedAvailableIds.length === 0}
                onClick={onAddSelected}
                title="Adicionar selecionados"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </EmpConfigMoveBtn>
              <EmpConfigMoveBtn
                disabled={allAvailableItems.length === 0}
                onClick={onAddAll}
                title="Adicionar todos"
              >
                <SkipForward className="h-3 w-3" />
              </EmpConfigMoveBtn>
            </section>

            <main
              className="emp-config-transfer-panel overflow-hidden flex flex-col"
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDropToUsed}
            >
              <div className="emp-config-transfer-border-b emp-config-transfer-panel__title emp-config-transfer-panel__title--split">
                <span>{usedLabel}</span>
                <span className="emp-config-transfer-panel__count">
                  {allUsedItems.length} {usedCountLabel}
                </span>
              </div>
              <div className="emp-config-transfer-border-b emp-config-transfer-panel__search">
                <EmpConfigSearchField
                  value={searchUsed}
                  onChange={onSearchUsedChange}
                  placeholder={searchUsedPlaceholder}
                />
              </div>
              <div className="emp-config-transfer-panel__list flex-1 overflow-auto">
                {usedItems.length === 0 ? (
                  <div className="emp-config-transfer-empty">{emptyUsedMessage}</div>
                ) : (
                  usedItems.map((item) => {
                    const originalIndex = allUsedItems.findIndex(
                      (entry) => entry.id === item.id
                    );
                    return renderItemButton({
                      item,
                      selected: selectedUsedIds.includes(item.id),
                      onClick: (event) => onSelectUsed?.(item.id, event),
                      subtitle: "Em uso",
                      index: originalIndex,
                      origem: "used",
                    });
                  })
                )}
              </div>
            </main>
          </div>
        {footer ? <div className={EMP_CONFIG_DIALOG_FOOTER}>{footer}</div> : null}
      </div>
    </div>
  );
}

export function EmpConfigListTable({
  formRow,
  columns = [],
  rows = [],
  emptyMessage = "Nenhum registro encontrado.",
}) {
  const gridTemplate = columns.map((column) => column.width || "1fr").join(" ");

  return (
    <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
      <div className={EMP_CONFIG_DIALOG_TABLE_SHELL}>
          {formRow ? (
            formRow.variant === "launch" ? (
              <div className="emp-config-launch-form-row">
                {formRow.leading ? (
                  <div className="emp-config-launch-form-row__leading">{formRow.leading}</div>
                ) : null}
                <div className="mg-prototype-form mg-prototype-form--edit emp-config-launch-form-row__field">
                  <div
                    data-field={formRow.fieldName || "config-field"}
                    className={`fg mg-prototype-field${formRow.hasValue ? " mg-has-value" : ""}`}
                  >
                    <label className={`fg-label${formRow.required ? " required" : ""}`}>
                      {formRow.label}
                    </label>
                    {formRow.control}
                  </div>
                </div>
              </div>
            ) : (
              <div className="emp-config-list-form-row">
                <label className="emp-config-list-form-row__label">
                  {formRow.label}
                  {formRow.required ? <span className="emp-config-list-form-row__required">*</span> : null}
                </label>
                <div className="emp-config-list-form-row__control">{formRow.control}</div>
              </div>
            )
          ) : null}

          <div className="emp-config-list-table__scroll">
            <div
              className="emp-config-list-table__head"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {columns.map((column) => (
                <div key={column.key} className="emp-config-list-table__th">
                  {column.label}
                </div>
              ))}
            </div>

            {rows.length === 0 ? (
              <div className="emp-config-transfer-empty">{emptyMessage}</div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.key}
                  className={`emp-config-list-table__row ${row.className || ""}`}
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {row.cells.map((cell, index) => (
                    <div key={`${row.key}-${index}`} className="emp-config-list-table__td">
                      {cell}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
      </div>
    </div>
  );
}

export const EMP_CONFIG_TRANSFER_DIALOG_CLASS = EMP_CONFIG_DIALOG_TRANSFER_DIALOG;
export const EMP_CONFIG_LIST_DIALOG_CLASS = EMP_CONFIG_DIALOG_LIST_DIALOG;
