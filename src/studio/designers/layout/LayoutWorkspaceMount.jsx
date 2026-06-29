import { useEffect, useState } from "react";
import { LayoutDesignerPlugin } from "@/studio/designers/layout/LayoutDesignerPlugin.jsx";

/** Mounts Layout Studio in workspace when designerId === layout */
export function LayoutWorkspaceMount({ moduleId, sdk, hub, onValidationChange, onPreviewChange }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Inicializando Layout Studio…
      </div>
    );
  }
  return (
    <LayoutDesignerPlugin
      moduleId={moduleId}
      sdk={sdk}
      hub={hub}
      onValidationChange={onValidationChange}
      onPreviewChange={onPreviewChange}
    />
  );
}

export default LayoutWorkspaceMount;
