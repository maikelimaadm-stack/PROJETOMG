import React from "react";

/**
 * Casca de popover com bico apontando para o botão acionador (estilo balão).
 */
export default function MgPopoverShell({
  className = "",
  bodyClassName = "",
  arrowAlign = "end",
  children,
  ...props
}) {
  return (
    <div className={`mg-popover-shell ${className}`.trim()} {...props}>
      <div
        className={`mg-popover-shell__arrow mg-popover-shell__arrow--${arrowAlign}`}
        aria-hidden="true"
      />
      <div className={`mg-popover-shell__body ${bodyClassName}`.trim()}>{children}</div>
    </div>
  );
}
