import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/shared/utils/utils"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("erp-scrollbar relative overflow-hidden", className)}
    {...props}>
    <ScrollAreaPrimitive.Viewport className="erp-scrollbar h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none bg-[var(--erp-scrollbar-track)] p-0 m-0 border-0 shadow-none",
      orientation === "vertical" &&
        "h-full w-[var(--erp-scrollbar-size)]",
      orientation === "horizontal" &&
        "h-[var(--erp-scrollbar-size)] w-full flex-col",
      className
    )}
    {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative m-0 flex-1 border-0 shadow-none rounded-[var(--erp-scrollbar-radius)] bg-[var(--erp-scrollbar-thumb)] hover:bg-[var(--erp-scrollbar-thumb-hover)] active:bg-[var(--erp-scrollbar-thumb-active)]" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
