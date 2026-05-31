import React from "react";

export default function ToggleSwitch({ checked, disabled = false, onChange, className = "", checkedClassName, variant = "default" }) {
  const isForm = variant === "form";
  const trackCheckedClass = checkedClassName || (isForm ? "bg-sky-100 hover:bg-sky-100 border-sky-300" : "bg-white hover:bg-slate-50");
  const thumbClass = checked
    ? (isForm ? "right-0.5 bg-blue-600" : "right-0.5 bg-slate-700")
    : (isForm ? "left-0.5 bg-slate-300" : "left-0.5 bg-slate-300");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`!h-4 !w-8 relative inline-flex items-center transition-colors !border !border-slate-300 shadow-none rounded-[1px] ${checked ? trackCheckedClass : "bg-white hover:bg-slate-50"} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${thumbClass}`} />
    </button>
  );
}