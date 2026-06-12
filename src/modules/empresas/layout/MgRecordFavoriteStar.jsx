import React from "react";
import { Star } from "lucide-react";

export default function MgRecordFavoriteStar({
  active = false,
  disabled = false,
  onToggle,
  className = "",
}) {
  return (
    <button
      type="button"
      className={`mg-record-fav-btn${active ? " is-active" : ""}${className ? ` ${className}` : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        if (disabled) return;
        onToggle?.();
      }}
      disabled={disabled}
      aria-label={active ? "Remover favorito" : "Adicionar favorito"}
      aria-pressed={active}
    >
      <Star
        className="mg-record-fav-btn__icon"
        strokeWidth={2}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
