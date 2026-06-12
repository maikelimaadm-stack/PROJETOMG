import React from "react";
import { Bookmark } from "lucide-react";

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
      <Bookmark className="mg-record-fav-btn__icon" strokeWidth={2.25} />
    </button>
  );
}
