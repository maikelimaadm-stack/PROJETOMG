import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmpToolbarIcon from "@/components/emp/toolbars/EmpToolbarIcon";
import { EMP_TOOLBAR_BTN } from "@/components/emp/toolbars/empToolbarStyles";

export const EMP_SYSTEM_PANEL_IDS = ["principal", "geral", "endereco", "observacoes", "campos_personalizados"];

const formatPanelLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

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
    <div className="emp-form-tabs relative flex h-7 items-end justify-start bg-white pl-2 pr-2">
      <div className="emp-form-tab-nav-group relative z-20 mr-1.5 flex h-7 shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => scrollPanels(-1)}
          className={`${EMP_TOOLBAR_BTN} emp-form-tab-nav-btn`}
          title="Rolar painéis"
          aria-label="Rolar painéis para a esquerda"
        >
          <EmpToolbarIcon icon={ChevronLeft} nav />
        </button>
        <button
          type="button"
          onClick={() => scrollPanels(1)}
          className={`${EMP_TOOLBAR_BTN} emp-form-tab-nav-btn`}
          title="Rolar painéis"
          aria-label="Rolar painéis para a direita"
        >
          <EmpToolbarIcon icon={ChevronRight} nav />
        </button>
      </div>
      <div
        ref={panelsScrollRef}
        className="flex h-7 min-w-0 flex-1 items-end gap-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={`emp-form-tab relative z-10 flex-none min-w-max whitespace-nowrap ${
                active ? "emp-form-tab-active" : "emp-form-tab-inactive"
              }`}
            >
              {formatPanelLabel(tab.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
