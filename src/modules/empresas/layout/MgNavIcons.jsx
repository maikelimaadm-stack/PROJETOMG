import React from "react";

/**
 * Ícones de navegação MG — estilo protótipo:
 * - MgNavSkipIcon: primeiro/último/todos (triângulo + chevron)
 * - MgNavStepIcon: anterior/próximo (chevron único)
 */
export function MgNavStepIcon({ direction = "right", className = "", ...props }) {
  const mirror = direction === "left";

  return (
    <svg
      viewBox="0 0 16 16"
      className={`mg-nav-icon${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      {...props}
    >
      <g transform={mirror ? "translate(16 0) scale(-1 1)" : undefined}>
        <path
          d="M6 3.75 L11.25 8 L6 12.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function MgNavSkipIcon({ direction = "right", className = "", ...props }) {
  const mirror = direction === "left";

  return (
    <svg
      viewBox="0 0 16 16"
      className={`mg-nav-icon${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      {...props}
    >
      <g transform={mirror ? "translate(16 0) scale(-1 1)" : undefined}>
        <path d="M2.4 8 L5.85 4.55 L5.85 11.45 Z" fill="currentColor" stroke="none" />
        <path
          d="M7.65 3.85 L12.15 8 L7.65 12.15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
