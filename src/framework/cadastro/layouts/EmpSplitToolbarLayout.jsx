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
          className={`emp-toolbar-card shrink-0 overflow-hidden rounded-md border border-[#f4f4f4] bg-white shadow-sm ${toolbarClassName}`.trim()}
        >
          {toolbar}
        </div>
      ) : null}
      <div
        className={`emp-content-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#f4f4f4] bg-white shadow-sm ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
