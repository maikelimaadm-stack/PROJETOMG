import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmpCustomMarker from "@/components/emp/shared/EmpCustomMarker";

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
  systemPanelIds = EMP_SYSTEM_PANEL_IDS
}) {
  const panelsScrollRef = useRef(null);

  if (!tabs.length) return null;

  const scrollPanels = (direction) =>
    panelsScrollRef.current?.scrollBy({ left: direction * 260, behavior: "smooth" });

  return (
    <div className="emp-form-tabs relative flex h-9 items-end gap-0 bg-white px-4 md:px-8">
      <button
        type="button"
        onClick={() => scrollPanels(-1)}
        className="emp-form-tab-nav-btn relative z-20 mb-px mr-1"
        title="Rolar painéis"
        aria-label="Rolar painéis para a esquerda"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => scrollPanels(1)}
        className="emp-form-tab-nav-btn relative z-20 mb-px mr-2"
        title="Rolar painéis"
        aria-label="Rolar painéis para a direita"
      >
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <div
        ref={panelsScrollRef}
        className="flex min-w-0 flex-1 items-end gap-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const custom = isCustomPanel(tab, systemPanelIds);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={`emp-form-tab relative z-10 flex-none h-8 min-w-max px-4 text-xs whitespace-nowrap transition-colors ${
                active ? "emp-form-tab-active" : "emp-form-tab-inactive"
              }`}
            >
              {custom && <EmpCustomMarker />}
              {formatPanelLabel(tab.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
