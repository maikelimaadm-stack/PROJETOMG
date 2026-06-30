/** Formula Validation Panel (Program 3.2) */
export function FormulaValidationPanel({ pipeline }) {
  const validation = pipeline?.validation;
  const ok = validation?.ok;

  return (
    <div className="space-y-2 p-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-medium text-muted-foreground">Validação</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            ok ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-destructive/15 text-destructive"
          }`}
        >
          {ok ? "OK" : "Falhou"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Erros" value={(validation?.errors ?? []).length} />
        <Stat label="Avisos" value={(validation?.warnings ?? []).length} />
        <Stat label="Dependências" value={(pipeline?.dependencies ?? []).length} />
        <Stat label="Custo" value={String(validation?.costEstimate ?? "—")} />
      </div>
      <div className="text-[10px] text-muted-foreground">
        Pipeline: Formula Document → Computation Document → Expression AST → Execution Graph → Preview
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded border border-border px-2 py-1">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

export default FormulaValidationPanel;
