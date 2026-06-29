import { useStudioShell } from "./StudioShellProvider.jsx";

export function StudioStatusBar() {
  const { sdk, activeModuleId, isPrototype } = useStudioShell();
  const selection = sdk.selection.getSelection();

  return (
    <footer className="studio-shell__statusbar flex items-center justify-between px-3 py-0.5 text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>{isPrototype ? "Mock · desconectado" : "Conectado"}</span>
        <span>·</span>
        <span>módulo: {activeModuleId}</span>
        <span>·</span>
        <span>rascunho</span>
      </div>
      <div className="flex items-center gap-3">
        {selection.entryId && (
          <span>
            seleção: {selection.entryType}/{selection.entryId}
          </span>
        )}
        <span>validação: 0</span>
      </div>
    </footer>
  );
}

export default StudioStatusBar;
