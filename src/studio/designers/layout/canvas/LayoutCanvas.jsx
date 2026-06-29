import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_CANVAS_CONFIG,
  createCanvasEngineState,
  canvasZoom,
  canvasPan,
  canvasSelect,
} from "./canvasEngine.js";

/** Layout Canvas — zoom/pan/grid/overlays/multi-selection ready (Program 2.2) */
export function LayoutCanvas({
  document: layoutDocument,
  selectedComponentId,
  onSelectComponent,
  onMoveComponent,
  commandBus,
}) {
  const [engine, setEngine] = useState(() => createCanvasEngineState(DEFAULT_CANVAS_CONFIG));
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);

  const components = useMemo(() => {
    const list = [];
    (layoutDocument?.pages ?? []).forEach((page) => {
      (page.sections ?? []).forEach((section) => {
        (section.containers ?? []).forEach((container) => {
          (container.components ?? []).forEach((component) => {
            list.push({ ...component, sectionId: section.sectionId, containerId: container.containerId });
          });
        });
      });
    });
    return list;
  }, [layoutDocument]);

  const handleWheel = useCallback(
    (event) => {
      if (!engine.config.zoom.enabled) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -engine.config.zoom.step : engine.config.zoom.step;
      setEngine((s) => canvasZoom(s, delta));
    },
    [engine.config.zoom]
  );

  const handlePointerDown = useCallback((event) => {
    if (event.button === 1 || event.altKey) {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!isPanning || !panStart) return;
      const dx = event.clientX - panStart.x;
      const dy = event.clientY - panStart.y;
      setEngine((s) => canvasPan(s, dx, dy));
      setPanStart({ x: event.clientX, y: event.clientY });
    },
    [isPanning, panStart]
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const transformStyle = {
    transform: `translate(${engine.pan.x}px, ${engine.pan.y}px) scale(${engine.zoom})`,
    transformOrigin: "0 0",
  };

  return (
    <div className="layout-canvas relative h-full w-full overflow-hidden bg-muted/20">
      <div className="layout-canvas__toolbar flex items-center gap-2 border-b border-border px-2 py-1 text-[10px] text-muted-foreground">
        <span>Zoom {(engine.zoom * 100).toFixed(0)}%</span>
        <span>·</span>
        <span>Grid {engine.config.grid.enabled ? "on" : "off"}</span>
        <span>·</span>
        <span>Snap {engine.config.snap.enabled ? "on" : "off"}</span>
        <span>·</span>
        <span>{components.length} componentes</span>
      </div>
      <div
        className="layout-canvas__viewport relative h-[calc(100%-28px)] w-full cursor-default"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="presentation"
      >
        {engine.config.grid.enabled ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: `${engine.config.grid.size * engine.zoom}px ${engine.config.grid.size * engine.zoom}px`,
            }}
          />
        ) : null}
        <div className="absolute inset-0 p-6" style={transformStyle}>
          {(layoutDocument?.pages?.[0]?.sections ?? []).map((section) => (
            <div key={section.sectionId} className="mb-4 rounded border border-border bg-background/80 p-3">
              <div className="mb-2 text-xs font-medium text-foreground">{section.label}</div>
              <div className="relative min-h-[120px]">
                {components
                  .filter((c) => c.sectionId === section.sectionId)
                  .map((component) => {
                    const selected =
                      selectedComponentId === component.componentId ||
                      engine.selectedIds.includes(component.componentId);
                    const frame = component.frame ?? { x: 0, y: 0, width: 200, height: 40 };
                    return (
                      <button
                        key={component.componentId}
                        type="button"
                        className={`absolute rounded border px-2 py-1 text-left text-[11px] transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                        style={{
                          left: frame.x,
                          top: frame.y,
                          width: frame.width,
                          height: frame.height,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const multi = e.shiftKey && engine.config.multiSelection.enabled;
                          setEngine((s) => canvasSelect(s, [component.componentId], multi));
                          onSelectComponent?.(component);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <span className="font-mono text-[10px] text-muted-foreground">{component.type}</span>
                        <div className="truncate">{component.props?.fieldId ?? component.componentId}</div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        {engine.config.overlays.enabled ? (
          <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-background/90 px-2 py-1 text-[10px] text-muted-foreground shadow">
            Canvas Engine {engine.config.version}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default LayoutCanvas;
