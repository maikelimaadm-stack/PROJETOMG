import { useStudioShell } from "../shell/StudioShellProvider.jsx";

export function WorkspacePanel() {
  const { activeDesignerId, designers, token } = useStudioShell();
  const designer = designers.find((d) => d.designerId === activeDesignerId);

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div
        className="studio-shell__workspace-empty flex max-w-lg flex-col items-center gap-4 p-12 text-center"
        style={{ borderColor: token("color.border") }}
      >
        <h2 className="text-lg font-semibold">{designer?.label ?? "Designer"}</h2>
        <p className="text-sm text-muted-foreground">
          Workspace do protótipo — canvas do designer será montado aqui no Program 2.2 (Layout Studio).
        </p>
        <p className="text-xs text-muted-foreground">
          Dados simulados · sem MDP · sem Preview real
        </p>
        <div
          className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2 opacity-60"
          style={{ gap: token("spacing.sm") }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded border border-dashed border-border bg-muted/50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkspacePanel;
