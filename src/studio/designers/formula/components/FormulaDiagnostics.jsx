/** Formula Diagnostics — validation + evaluation diagnostics (Program 3.2) */
export function FormulaDiagnostics({ pipeline }) {
  const errors = pipeline?.validation?.errors ?? [];
  const warnings = pipeline?.validation?.warnings ?? [];
  const evalDiags = pipeline?.preview?.diagnostics ?? [];
  const hasCycle = pipeline?.cycles?.hasCycle;

  return (
    <div className="space-y-2 p-2 text-xs">
      <div className="font-medium text-muted-foreground">Diagnósticos</div>
      {hasCycle && (
        <div className="rounded border border-destructive/50 bg-destructive/10 px-2 py-1 text-destructive">
          Ciclo de dependência detectado (COMP_CYCLE)
        </div>
      )}
      {errors.length === 0 && warnings.length === 0 && evalDiags.length === 0 && !hasCycle && (
        <div className="text-muted-foreground">Nenhum problema detectado</div>
      )}
      {errors.map((err, i) => (
        <div key={`e-${i}`} className="rounded border border-destructive/40 bg-destructive/5 px-2 py-1 text-destructive">
          <span className="font-mono">{err.code ?? "ERROR"}</span>: {err.message}
        </div>
      ))}
      {warnings.map((w, i) => (
        <div key={`w-${i}`} className="rounded border border-amber-500/40 bg-amber-500/5 px-2 py-1 text-amber-700 dark:text-amber-400">
          <span className="font-mono">{w.code ?? "WARN"}</span>: {w.message}
        </div>
      ))}
      {evalDiags.map((d, i) => (
        <div key={`d-${i}`} className="rounded border border-border px-2 py-1">
          {d.message ?? JSON.stringify(d)}
        </div>
      ))}
    </div>
  );
}

export default FormulaDiagnostics;
