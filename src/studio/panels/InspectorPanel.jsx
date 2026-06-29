import { useEffect, useState } from "react";
import { useStudioShell } from "../shell/StudioShellProvider.jsx";

export function InspectorPanel() {
  const { sdk } = useStudioShell();
  const [selection, setSelection] = useState(sdk.selection.getSelection());

  useEffect(() => sdk.selection.subscribe(setSelection), [sdk.selection]);

  if (!selection.entryId) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        Selecione uma entrada no Explorer ou Workspace
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 text-xs">
      <div>
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Entry ID</div>
        <div className="font-mono">{selection.entryId}</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Tipo</div>
        <div>{selection.entryType}</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Status</div>
        <div>draft · mock</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Bindings</div>
        <div className="text-muted-foreground">Nenhum (protótipo)</div>
      </div>
    </div>
  );
}

export default InspectorPanel;
