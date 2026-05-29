import React from "react";

export default function ToggleSwitch({ checked, disabled = false, onChange, className = "", checkedClassName = "bg-white hover:bg-slate-50" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`!h-4 !w-8 relative inline-flex items-center transition-colors !border !border-slate-300 shadow-none rounded-[1px] ${checked ? checkedClassName : "bg-white hover:bg-slate-50"} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      aria-pressed={checked}>
      
      <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${checked ? "right-0.5 bg-slate-700" : "left-0.5 bg-slate-300"}`} />
    </button>);

}