/** Formula Preview — official Evaluation pipeline output (Program 3.2) */
export function FormulaPreview({ pipeline, sampleVariables, onSampleChange }) {
  const preview = pipeline?.preview;
  const ok = preview?.ok;
  const value = preview?.value;

  return (
    <div className="space-y-2 p-2 text-xs">
      <div className="font-medium text-muted-foreground">Preview (Evaluation Engine)</div>
      <div className="rounded-md border border-border bg-background p-2">
        {!pipeline?.formulaDocument?.expressionSource?.trim() ? (
          <span className="text-muted-foreground">Insira uma fórmula para visualizar o resultado</span>
        ) : ok ? (
          <span className="font-mono text-base">{formatPreviewValue(value)}</span>
        ) : (
          <span className="text-destructive">Falha na avaliação — veja diagnósticos</span>
        )}
      </div>
      <div>
        <div className="mb-1 font-medium text-muted-foreground">Variáveis de amostra</div>
        <div className="max-h-24 space-y-1 overflow-auto">
          {Object.entries(sampleVariables ?? {}).slice(0, 12).map(([name, val]) => (
            <label key={name} className="flex items-center gap-2">
              <span className="w-24 truncate font-mono">{name}</span>
              <input
                type="text"
                className="flex-1 rounded border border-border bg-background px-1 py-0.5 font-mono"
                value={val === null ? "null" : String(val)}
                onChange={(e) => {
                  const raw = e.target.value;
                  let parsed = raw;
                  if (raw === "null") parsed = null;
                  else if (raw === "true") parsed = true;
                  else if (raw === "false") parsed = false;
                  else if (!Number.isNaN(Number(raw)) && raw.trim() !== "") parsed = Number(raw);
                  onSampleChange?.(name, parsed);
                }}
              />
            </label>
          ))}
        </div>
      </div>
      {pipeline?.executionGraph && (
        <div className="text-[10px] text-muted-foreground">
          Execution Graph: {pipeline.executionGraph.getKernels?.()?.length ?? 0} kernel(s)
        </div>
      )}
    </div>
  );
}

function formatPreviewValue(value) {
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default FormulaPreview;
