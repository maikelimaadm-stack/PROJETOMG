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
      viewBox="0 0 20 16"
      className={`mg-nav-icon mg-nav-icon--skip${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      {...props}
    >
      <g transform={mirror ? "translate(20 0) scale(-1 1)" : undefined}>
        <path d="M0.5 8 L5.75 3.85 L5.75 12.15 Z" fill="currentColor" stroke="none" />
        <path
          d="M7.35 3.2 L14.85 8 L7.35 12.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
