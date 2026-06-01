import React from "react";

const ICON_CLASS = "w-3 h-3 shrink-0";

/** Cantos apontando para fora — entrar em tela cheia */
export function EmpFullscreenEnterIcon({ className = ICON_CLASS }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square">
      <path d="M1.25 4.25V1.25h3" />
      <path d="M7.75 1.25h3v3" />
      <path d="M10.75 7.75v3h-3" />
      <path d="M4.25 10.75H1.25V7.75" />
    </svg>
  );
}

/** Cantos apontando para dentro — sair da tela cheia (alternativa ao X) */
export function EmpFullscreenExitIcon({ className = ICON_CLASS }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square">
      <path d="M4.25 4.25H1.25V1.25h3" />
      <path d="M7.75 4.25h3V1.25h-3" />
      <path d="M7.75 7.75v3h-3V7.75" />
      <path d="M4.25 7.75H1.25v3h3" />
    </svg>
  );
}
