import React from "react";
import { BetweenHorizontalStart, RectangleHorizontal } from "lucide-react";

export const isCardColSpanSplit = (colSpan) => (Number(colSpan) || 12) <= 6;

export const CardColSpanIcon = ({ colSpan, className = "h-3 w-3 shrink-0" }) => {
  const Icon = isCardColSpanSplit(colSpan) ? BetweenHorizontalStart : RectangleHorizontal;
  return <Icon className={className} strokeWidth={2.1} aria-hidden="true" />;
};
