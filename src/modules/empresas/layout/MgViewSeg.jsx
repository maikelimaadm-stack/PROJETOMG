import React, { useRef } from "react";
import { FileText, LayoutDashboard, TableProperties } from "lucide-react";
import useMgSegSlider from "@/modules/empresas/layout/useMgSegSlider";

const MODES = [
  { id: "registro", icon: FileText, title: "Registro" },
  { id: "tabela", icon: TableProperties, title: "Tabela" },
  { id: "cards", icon: LayoutDashboard, title: "Cards" },
];

export default function MgViewSeg({ value, onChange, disabled = false }) {
  const segRef = useRef(null);
  const sliderRef = useRef(null);

  useMgSegSlider(segRef, sliderRef, ".view-mode-btn.active", [value]);

  return (
    <div className="view-seg" ref={segRef} id="view-seg">
      <div className="view-seg-slider" ref={sliderRef} id="view-seg-slider" aria-hidden="true" />
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            className={`view-mode-btn${active ? " active" : ""}`}
            data-view={mode.id}
            title={mode.title}
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange?.(mode.id)}
          >
            <Icon className="view-mode-btn__icon" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
