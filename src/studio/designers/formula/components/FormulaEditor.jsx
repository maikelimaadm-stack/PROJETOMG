/** Formula Editor — visual token trail + expression display (Program 3.2) */
export function FormulaEditor({ expressionSource, tokens, onInsertConstant, disabled }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-3 py-2">
        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Expressão</div>
        <div className="mt-1 min-h-[2.5rem] rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm">
          {expressionSource?.trim() ? expressionSource : (
            <span className="text-muted-foreground">Use a barra de ferramentas ou o explorador para montar a fórmula</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-3 py-2">
        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tokens visuais</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {(tokens ?? []).length === 0 && (
            <span className="text-xs text-muted-foreground">Nenhum token inserido</span>
          )}
          {(tokens ?? []).map((token, idx) => (
            <span
              key={`${token.kind}-${idx}`}
              className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
            >
              {token.kind === "field" && token.name}
              {token.kind === "function" && `${token.name}(…)`}
              {token.kind === "operator" && token.op}
              {token.kind === "constant" && String(token.value)}
              {token.kind === "paren" && token.value}
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-3 py-2">
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] text-muted-foreground">Constantes:</span>
          {[0, 1, 100, "null"].map((val) => (
            <button
              key={String(val)}
              type="button"
              disabled={disabled}
              className="rounded border border-border px-2 py-0.5 text-xs hover:bg-accent disabled:opacity-50"
              onClick={() => onInsertConstant?.({ kind: "constant", value: val })}
            >
              {String(val)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormulaEditor;
