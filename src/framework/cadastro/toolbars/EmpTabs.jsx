import React, { useRef } from "react";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import useMgSegSlider from "@/modules/empresas/layout/useMgSegSlider";

export const EMP_SYSTEM_PANEL_IDS = [
  "principais",
  "principal",
  "geral",
  "endereco",
  "observacoes",
  "campos_personalizados",
];

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
  variant = "default",
}) {
  const segRef = useRef(null);
  const sliderRef = useRef(null);

  useMgSegSlider(segRef, sliderRef, ".seg-tab.active", [activeTab, tabs, variant], {
    insetX: 10,
    bottom: 0,
  });

  if (!tabs.length) return null;

  const isMg = variant === "mg";

  if (isMg) {
    return (
      <div className="seg-control" role="tablist" ref={segRef}>
        <div className="seg-tab-slider seg-tab-slider--panel" ref={sliderRef} aria-hidden="true" />
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const custom = isCustomPanel(tab, systemPanelIds);
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange?.(tab.id)}
              className={`seg-tab${active ? " active" : ""}`}
            >
              {custom ? <EmpCustomMarker /> : null}
              {formatPanelLabel(tab.label)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="emp-form-tabs emp-form-tabs-launch relative flex min-h-[34px] items-end justify-start px-0">
      <div className="emp-form-tab-list flex min-h-[32px] min-w-0 flex-1 flex-wrap items-end gap-0">
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
              {custom ? <EmpCustomMarker /> : null}
              {formatPanelLabel(tab.label)}
            </button>
          );
        })}
      </div>
      {trailing ? (
        <div className="emp-form-tab-nav-end relative z-20 ml-1.5 flex shrink-0 items-center gap-1.5 self-center">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
