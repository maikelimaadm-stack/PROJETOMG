import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmpCustomMarker from "@/components/emp/shared/EmpCustomMarker";

export const EMP_SYSTEM_PANEL_IDS = ["principal", "geral", "endereco", "observacoes", "campos_personalizados"];

const tabNavButtonClass =
  "relative z-20 h-7 w-7 self-center rounded-none border-0 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-600 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center justify-center";

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
    <div className="relative h-9 bg-white flex items-end gap-0 before:absolute before:left-0 before:right-0 before:bottom-0 before:h-px before:bg-slate-300">
      <button
        type="button"
        onClick={() => scrollPanels(-1)}
        className={`${tabNavButtonClass} border-r border-slate-300`}
        title="Rolar painéis"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => scrollPanels(1)} className={tabNavButtonClass} title="Rolar painéis">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <div
        ref={panelsScrollRef}
        className="flex min-w-0 flex-1 items-end gap-0 overflow-x-auto overflow-y-hidden px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const custom = isCustomPanel(tab, systemPanelIds);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={`relative z-10 flex-none h-8 min-w-max px-4 mx-0.5 border border-slate-300 text-xs whitespace-nowrap transition-colors overflow-hidden ${
                active
                  ? "bg-white font-semibold text-slate-600 border-t-2 border-t-[#082e54] border-b-white"
                  : "bg-slate-50 text-slate-500 border-b-slate-300 hover:bg-white"
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
