import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";

/** Alinhado a --mg-motion-duration / --mg-motion-ease do design system MG. */
export const LAYOUT_CONFIG_EASE = [0.2, 0.8, 0.2, 1];
export const LAYOUT_CONFIG_DURATION = 0.22;

export const layoutConfigTransition = {
  layout: {
    duration: LAYOUT_CONFIG_DURATION,
    ease: LAYOUT_CONFIG_EASE,
  },
  default: {
    duration: LAYOUT_CONFIG_DURATION,
    ease: LAYOUT_CONFIG_EASE,
  },
};

export const layoutFieldPresence = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

const motionTransition = {
  ...layoutConfigTransition.default,
  layout: layoutConfigTransition.layout,
};

export function LayoutConfigMotionGroup({ children, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function LayoutConfigFieldShell({
  className = "",
  style,
  layout = false,
  children,
}) {
  if (!layout) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      layout="position"
      transition={motionTransition}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function LayoutConfigRowShell({ className = "", layout = false, children, ...props }) {
  if (!layout) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      layout="position"
      transition={motionTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function LayoutConfigDropLine({ show, orientation = "vertical", edge = "before", className = "" }) {
  if (!show) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "emp-layout-config-drop-line emp-layout-config-drop-line--visible",
        orientation === "vertical"
          ? "emp-layout-config-drop-line--vertical"
          : "emp-layout-config-drop-line--horizontal",
        edge === "before"
          ? orientation === "vertical"
            ? "emp-layout-config-drop-line--before"
            : "emp-layout-config-drop-line--row-before"
          : orientation === "vertical"
            ? "emp-layout-config-drop-line--after"
            : "emp-layout-config-drop-line--row-after",
        className
      )}
    />
  );
}

export function LayoutConfigPanelBody({ panelKey, className = "", motionEnabled = true, children }) {
  if (!motionEnabled) {
    return (
      <div key={panelKey} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      key={panelKey}
      initial={{ opacity: 0.72, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={layoutConfigTransition.default}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LayoutConfigSidebarList({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
