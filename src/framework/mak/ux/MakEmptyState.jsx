import React from "react";

/**
 * Estado vazio reutilizável para listagens, grids e painéis MAK.
 */
export default function MakEmptyState({
  title = "Nenhum registro encontrado",
  description = null,
  className = "",
  role = "status",
  "aria-live": ariaLive = "polite",
}) {
  return (
    <div
      className={`mak-empty-state${className ? ` ${className}` : ""}`}
      role={role}
      aria-live={ariaLive}
    >
      <p className="mak-empty-state__title">{title}</p>
      {description ? <p className="mak-empty-state__description">{description}</p> : null}
    </div>
  );
}
