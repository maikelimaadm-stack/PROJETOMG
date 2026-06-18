import React from "react";

/**
 * Ícone engrenagem + funil (configuração de filtros).
 * Usa currentColor para herdar a cor dos demais ícones da toolbar.
 */
export default function FilterConfigIcon({
  className = "h-3.5 w-3.5",
  strokeWidth = 2.2,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M9.2 4.2h5.6" />
      <path d="M12 2.6v1.5" />
      <path d="M7.1 6.1l1.1-1.1" />
      <path d="M16.9 6.1l-1.1-1.1" />
      <circle cx="12" cy="7.1" r="2.3" />
      <path d="M5.4 12.8h13.2" />
      <path d="M5.4 12.8 9.6 18.8" />
      <path d="M18.6 12.8 14.4 18.8" />
      <path d="M9.6 18.8v2.4" />
      <path d="M14.4 18.8 12 21.4" />
    </svg>
  );
}
