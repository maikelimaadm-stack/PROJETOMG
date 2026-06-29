import { Search, Bell, Command } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useStudioShell } from "./StudioShellProvider.jsx";
import { StudioBreadcrumbs } from "./StudioBreadcrumbs.jsx";

export function StudioTopBar() {
  const { setCommandOpen, notifications, activeModuleId, designers, activeDesignerId } = useStudioShell();
  const moduleLabel = activeModuleId;
  const designerLabel = designers.find((d) => d.designerId === activeDesignerId)?.label ?? activeDesignerId;

  return (
    <header className="studio-shell__topbar flex h-11 shrink-0 items-center gap-3 px-3">
      <span className="studio-shell__badge-prototype">PROTOTYPE</span>
      <span className="text-sm font-semibold">MAK Studio</span>
      <StudioBreadcrumbs segments={[moduleLabel, designerLabel]} />
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
          <kbd className="rounded border bg-muted px-1 text-[10px]">⌘K</kbd>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCommandOpen(true)}>
          <Command className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>
    </header>
  );
}

export default StudioTopBar;
