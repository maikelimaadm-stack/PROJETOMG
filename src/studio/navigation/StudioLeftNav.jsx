import { LayoutGrid, Workflow, BarChart3, Settings } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { useStudioShell } from "../shell/StudioShellProvider.jsx";

const ICONS = {
  building: LayoutGrid,
  layers: Workflow,
  layout: LayoutGrid,
  field: Settings,
  workflow: Workflow,
  dashboard: BarChart3,
};

export function StudioLeftNav() {
  const { modules, designers, activeModuleId, activeDesignerId, setModule, setDesigner } = useStudioShell();

  return (
    <nav
      aria-label="Studio navigation"
      className="flex w-44 shrink-0 flex-col border-r border-border bg-muted/30"
    >
      <div className="studio-shell__panel-header px-3 py-2">Módulos</div>
      <ul className="p-1">
        {modules.map((mod) => {
          const Icon = ICONS[mod.icon] ?? LayoutGrid;
          return (
            <li key={mod.moduleId}>
              <button
                type="button"
                disabled={mod.disabled}
                onClick={() => !mod.disabled && setModule(mod.moduleId)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
                  activeModuleId === mod.moduleId && "bg-accent font-medium",
                  mod.disabled && "cursor-not-allowed opacity-40"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {mod.label}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="studio-shell__panel-header mt-2 px-3 py-2">Designers</div>
      <ul className="flex-1 p-1">
        {designers.map((d) => (
          <li key={d.designerId}>
            <button
              type="button"
              disabled={!d.enabled}
              onClick={() => d.enabled && setDesigner(d.designerId)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
                activeDesignerId === d.designerId && d.enabled && "bg-accent font-medium",
                !d.enabled && "cursor-not-allowed opacity-40"
              )}
            >
              {d.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default StudioLeftNav;
