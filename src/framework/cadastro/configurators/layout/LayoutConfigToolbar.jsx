import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const LayoutToolbarBtn = ({ className = "", children, ...props }) => (
  <button type="button" className={`ios-btn tb-btn ${className}`} {...props}>
    {children}
  </button>
);

export const LayoutIconBtn = ({ className = "", children, ...props }) => (
  <LayoutToolbarBtn className={`tb-btn-ghost tb-btn-icon ${className}`} {...props}>
    {children}
  </LayoutToolbarBtn>
);

export const LayoutTransferBtn = ({ children, ...props }) => (
  <button
    type="button"
    className="ios-btn mg-nav-btn mg-panel-tabs-rail__nav emp-layout-config-transfer-btn"
    {...props}
  >
    {children}
  </button>
);

export const LayoutTabsScrollBtn = ({ direction, disabled, onClick, label }) => {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      className={`ios-btn mg-nav-btn mg-panel-tabs-rail__nav mg-panel-tabs-rail__nav--${direction}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <Icon className="mg-panel-tabs-rail__nav-icon" strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
};

export const LayoutConfigTabsRail = ({
  leading = null,
  viewportRef,
  canScrollLeft,
  canScrollRight,
  hasOverflow,
  scrollLeft,
  scrollRight,
  children,
}) => (
  <div className="mg-panel-tabs-rail">
    {leading ? <div className="mg-panel-tabs-rail__leading">{leading}</div> : null}
    {hasOverflow ? (
      <LayoutTabsScrollBtn
        direction="prev"
        disabled={!canScrollLeft}
        onClick={scrollLeft}
        label="Rolar para a esquerda"
      />
    ) : null}
    <div ref={viewportRef} className="mg-panel-tabs-rail__viewport">
      {children}
    </div>
    {hasOverflow ? (
      <LayoutTabsScrollBtn
        direction="next"
        disabled={!canScrollRight}
        onClick={scrollRight}
        label="Rolar para a direita"
      />
    ) : null}
  </div>
);
