import React from "react";
import { Bookmark } from "lucide-react";

const FAV_GREEN = "var(--mg-brand-green)";
const FAV_GREEN_HOVER = "var(--mg-brand-green-hover)";

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
      <Bookmark
        className="mg-record-fav-btn__icon"
        strokeWidth={2.25}
        stroke={FAV_GREEN}
        fill={active ? FAV_GREEN : "#ffffff"}
      />
    </button>
  );
}
