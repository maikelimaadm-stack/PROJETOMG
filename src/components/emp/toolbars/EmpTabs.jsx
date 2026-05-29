import React from "react";

export default function EmpTabs({ tabs = [], activeTab, onChange }) {
  if (!tabs.length) return null;

  return (
    <div className="h-8 flex items-end gap-0 bg-white border-y border-slate-300 px-4 md:px-8 overflow-x-auto">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            className={`h-7 px-4 -mb-px border border-slate-300 text-xs whitespace-nowrap rounded-none ${
              active ? "bg-white border-b-white font-semibold text-slate-600" : "bg-slate-50 text-slate-500 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}