import React, { useEffect, useRef } from "react";
import { FileText, LayoutGrid, Table } from "lucide-react";

const MODES = [
  { id: "registro", icon: FileText, title: "Registro" },
  { id: "tabela", icon: Table, title: "Tabela" },
  { id: "cards", icon: LayoutGrid, title: "Cards" },
];

export default function MgViewSeg({ value, onChange, disabled = false }) {
  const segRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const seg = segRef.current;
    const slider = sliderRef.current;
    if (!seg || !slider) return;

    const btns = seg.querySelectorAll(".view-mode-btn");
    let idx = 0;
    btns.forEach((btn, i) => {
      if (btn.dataset.view === value) idx = i;
    });
    const btnWidth = btns[0]?.offsetWidth || 34;
    slider.style.width = `${btnWidth}px`;
    slider.style.transform = `translateX(${idx * btnWidth}px)`;
  }, [value]);

  return (
    <div className="view-seg" ref={segRef} id="view-seg">
      <div className="view-seg-slider" ref={sliderRef} id="view-seg-slider" />
      {MODES.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            type="button"
            className={`view-mode-btn ios-btn${value === mode.id ? " active" : ""}`}
            data-view={mode.id}
            title={mode.title}
            disabled={disabled}
            onClick={() => onChange?.(mode.id)}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
