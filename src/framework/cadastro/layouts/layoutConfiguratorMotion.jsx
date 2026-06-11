import React from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";

/** Alinhado a --mg-motion-duration / --mg-motion-ease do design system MG. */
export const LAYOUT_CONFIG_EASE = [0.2, 0.8, 0.2, 1];
export const LAYOUT_CONFIG_DURATION = 0.22;

export const layoutConfigTransition = {
  layout: {
    type: "spring",
    stiffness: 520,
    damping: 42,
    mass: 0.85,
  },
  default: {
    duration: LAYOUT_CONFIG_DURATION,
    ease: LAYOUT_CONFIG_EASE,
  },
  exit: {
    duration: 0.16,
    ease: LAYOUT_CONFIG_EASE,
  },
};

export const layoutFieldPresence = {
  initial: { opacity: 0, x: -10, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 10, scale: 0.98 },
};

export const layoutPanelPresence = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function LayoutConfigMotionGroup({ children, className = "", ...props }) {
  return (
    <LayoutGroup id="emp-layout-configurator">
      <div className={className} {...props}>
        {children}
      </div>
    </LayoutGroup>
  );
}

export function LayoutConfigFieldShell({
  fieldId,
  className = "",
  style,
  layout = true,
  initial = false,
  animate,
  exit,
  children,
}) {
  return (
    <motion.div
      layout={layout}
      layoutId={fieldId ? `layout-config-field-${fieldId}` : undefined}
      transition={{
        ...layoutConfigTransition.default,
        layout: layoutConfigTransition.layout,
      }}
      initial={initial}
      animate={animate}
      exit={exit}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function LayoutConfigRowShell({ rowId, className = "", layout = true, children, ...props }) {
  return (
    <motion.div
      layout={layout}
      layoutId={rowId ? `layout-config-row-${rowId}` : undefined}
      transition={{
        ...layoutConfigTransition.default,
        layout: layoutConfigTransition.layout,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function LayoutConfigDropLine({ show, orientation = "vertical", edge = "before", className = "" }) {
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.span
          key={`${orientation}-${edge}`}
          aria-hidden
          initial={{
            opacity: 0,
            scaleX: orientation === "vertical" ? 1 : 0.2,
            scaleY: orientation === "vertical" ? 0.2 : 1,
          }}
          animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
          exit={{
            opacity: 0,
            scaleX: orientation === "vertical" ? 1 : 0.2,
            scaleY: orientation === "vertical" ? 0.2 : 1,
          }}
          transition={layoutConfigTransition.default}
          className={cn(
            "emp-layout-config-drop-line",
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
      ) : null}
    </AnimatePresence>
  );
}

export function LayoutConfigDropGap({ show, orientation = "vertical" }) {
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.span
          key="drop-gap"
          aria-hidden
          initial={{
            opacity: 0,
            width: orientation === "vertical" ? 0 : "100%",
            height: orientation === "vertical" ? "auto" : 0,
          }}
          animate={{
            opacity: 1,
            width: orientation === "vertical" ? 52 : "100%",
            height: orientation === "vertical" ? "auto" : 14,
          }}
          exit={{
            opacity: 0,
            width: orientation === "vertical" ? 0 : "100%",
            height: orientation === "vertical" ? "auto" : 0,
          }}
          transition={layoutConfigTransition.default}
          className={cn(
            "emp-layout-config-drop-gap",
            orientation === "vertical"
              ? "emp-layout-config-drop-gap--vertical"
              : "emp-layout-config-drop-gap--horizontal"
          )}
        />
      ) : null}
    </AnimatePresence>
  );
}

export function LayoutConfigPanelBody({ panelKey, className = "", children }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={panelKey}
        initial={layoutPanelPresence.initial}
        animate={layoutPanelPresence.animate}
        exit={layoutPanelPresence.exit}
        transition={layoutConfigTransition.default}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function LayoutConfigSidebarList({ mode, children, className = "" }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, x: mode === "available" ? -8 : 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: mode === "available" ? 8 : -8 }}
        transition={layoutConfigTransition.default}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export { AnimatePresence, motion };
