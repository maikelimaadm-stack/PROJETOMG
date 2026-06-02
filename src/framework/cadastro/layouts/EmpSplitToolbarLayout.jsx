import React from "react";

export default function EmpSplitToolbarLayout({
  toolbar,
  children,
  className = "",
  toolbarClassName = "",
  contentClassName = "",
}) {
  return (
    <div className={`emp-split-view flex min-h-0 flex-1 flex-col gap-2 overflow-hidden ${className}`.trim()}>
      {toolbar ? (
        <div
          className={`emp-toolbar-card shrink-0 overflow-hidden ${toolbarClassName}`.trim()}
        >
          {toolbar}
        </div>
      ) : null}
      <div
        className={`emp-content-card flex min-h-0 flex-1 flex-col overflow-hidden basis-0 ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
