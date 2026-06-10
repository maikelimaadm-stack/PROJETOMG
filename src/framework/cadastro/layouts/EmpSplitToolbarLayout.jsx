import React from "react";

export default function EmpSplitToolbarLayout({
  toolbar,
  children,
  className = "",
  toolbarClassName = "",
  contentClassName = "",
  unifiedChrome = false,
}) {
  return (
    <div
      className={`emp-split-view flex h-full min-h-0 flex-1 flex-col overflow-hidden ${unifiedChrome ? "emp-split-view--unified-chrome" : ""} ${className}`.trim()}
    >
      {toolbar && !unifiedChrome ? (
        <div
          className={`emp-toolbar-card shrink-0 overflow-hidden ${toolbarClassName}`.trim()}
        >
          {toolbar}
        </div>
      ) : null}
      <div
        className={`emp-content-card flex min-h-0 flex-1 flex-col overflow-hidden ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
