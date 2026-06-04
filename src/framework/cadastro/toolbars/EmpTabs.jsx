import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import EmpToolbarIcon from "@/framework/cadastro/toolbars/EmpToolbarIcon";
import { EMP_TOOLBAR_BTN } from "@/framework/cadastro/toolbars/empToolbarStyles";
import { usePanelTabsScroll } from "@/framework/cadastro/toolbars/usePanelTabsScroll";

export const EMP_SYSTEM_PANEL_IDS = ["principal", "geral", "endereco", "observacoes", "campos_personalizados"];

const formatPanelLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const isCustomPanel = (panel, systemPanelIds) => panel && !systemPanelIds.includes(panel.id);

export default function EmpTabs({
  tabs = [],
  activeTab,
  onChange,
  systemPanelIds = EMP_SYSTEM_PANEL_IDS,
  trailing = null,
}) {
  const panelsScrollRef = useRef(null);
  const { canScrollLeft, canScrollRight } = usePanelTabsScroll(panelsScrollRef, [tabs, activeTab]);

  if (!tabs.length) return null;

  const scrollPanels = (direction) =>
    panelsScrollRef.current?.scrollBy({ left: direction * 260, behavior: "smooth" });

  return (
    <div className="emp-form-tabs emp-form-tabs-launch relative flex min-h-[34px] items-end justify-start pl-2 pr-2">
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scrollPanels(-1)}
          className={`${EMP_TOOLBAR_BTN} emp-form-tab-nav-btn relative z-20 mr-1.5 shrink-0 self-center`}
          title="Rolar painéis"
          aria-label="Rolar painéis para a esquerda"
        >
          <EmpToolbarIcon icon={ChevronLeft} nav />
        </button>
      ) : null}
      <div
        ref={panelsScrollRef}
        className="emp-form-tab-list flex h-[30px] min-w-0 flex-1 items-end overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const custom = isCustomPanel(tab, systemPanelIds);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={`emp-form-tab relative flex-none min-w-max overflow-hidden whitespace-nowrap ${
                active ? "emp-form-tab-active z-[15]" : "emp-form-tab-inactive z-[2]"
              }`}
            >
              {custom && <EmpCustomMarker />}
              {formatPanelLabel(tab.label)}
            </button>
          );
        })}
      </div>
      <div className="emp-form-tab-nav-end relative z-20 ml-1.5 flex shrink-0 items-center gap-1.5 self-center">
        {canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollPanels(1)}
            className={`${EMP_TOOLBAR_BTN} emp-form-tab-nav-btn`}
            title="Rolar painéis"
            aria-label="Rolar painéis para a direita"
          >
            <EmpToolbarIcon icon={ChevronRight} nav />
          </button>
        ) : null}
        {trailing}
      </div>
    </div>
  );
}
