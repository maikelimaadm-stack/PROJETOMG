import { Search, Command } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { UniversalBreadcrumb, UniversalNotificationArea } from "@/studio/components/index.js";
import { useStudioShell } from "./StudioShellContext.jsx";

export function StudioTopBar() {
  const { setCommandOpen, isPrototype } = useStudioShell();

  return (
    <header className="studio-shell__topbar flex h-11 shrink-0 items-center gap-3 px-3">
      {isPrototype ? <span className="studio-shell__badge-prototype">PROTOTYPE</span> : null}
      <span className="text-sm font-semibold">MAK Studio</span>
      <UniversalBreadcrumb />
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
        <UniversalNotificationArea />
      </div>
    </header>
  );
}

export default StudioTopBar;
