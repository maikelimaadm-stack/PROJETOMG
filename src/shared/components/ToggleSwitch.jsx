import React from "react";

export default function ToggleSwitch({
  checked,
  disabled = false,
  onChange,
  className = "",
  checkedClassName = "bg-white hover:bg-slate-50",
  variant = "default",
}) {
  const loteVariant = variant === "lote";
  const activeTrackClass = loteVariant ? "bg-[#4fafff] hover:bg-[#35a3f5]" : checkedClassName;
  const inactiveTrackClass = loteVariant ? "bg-slate-300 hover:bg-slate-400" : "bg-white hover:bg-slate-50";
  const thumbClass = loteVariant
    ? `absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? "right-0.5" : "left-0.5"}`
    : `absolute top-0.5 w-3 h-3 rounded-full transition-all ${checked ? "right-0.5 bg-slate-700" : "left-0.5 bg-slate-300"}`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`!h-4 !w-8 relative inline-flex items-center transition-colors !border !border-slate-300 shadow-none rounded-[1px] ${checked ? activeTrackClass : inactiveTrackClass} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      aria-pressed={checked}
    >
      <span className={thumbClass} />
    </button>
  );
}