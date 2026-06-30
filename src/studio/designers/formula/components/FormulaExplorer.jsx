/** Formula Explorer — fields, functions, dependencies (Program 3.2) */
export function FormulaExplorer({ fields, functions, dependencies, onInsertToken }) {
  return (
    <div className="flex h-full flex-col overflow-hidden text-xs">
      <section className="border-b border-border p-2">
        <div className="mb-1 font-medium text-muted-foreground">Campos</div>
        <ul className="max-h-32 space-y-0.5 overflow-auto">
          {fields.map((f) => (
            <li key={f.fieldNodeId}>
              <button
                type="button"
                className="w-full rounded px-1 py-0.5 text-left hover:bg-accent"
                onClick={() => onInsertToken?.({ kind: "field", name: f.fieldName, label: f.label })}
              >
                <span className="font-mono">{f.fieldName}</span>
                <span className="ml-1 text-muted-foreground">{f.fieldType}</span>
              </button>
            </li>
          ))}
          {fields.length === 0 && <li className="text-muted-foreground">Nenhum campo disponível</li>}
        </ul>
      </section>
      <section className="border-b border-border p-2">
        <div className="mb-1 font-medium text-muted-foreground">Funções</div>
        <ul className="max-h-32 space-y-0.5 overflow-auto">
          {functions.map((fn) => (
            <li key={fn.name}>
              <button
                type="button"
                className="w-full rounded px-1 py-0.5 text-left hover:bg-accent"
                onClick={() => onInsertToken?.({ kind: "function", name: fn.name })}
                title={fn.documentation}
              >
                <span className="font-mono">{fn.name}</span>
                <span className="ml-1 text-muted-foreground">→ {fn.returnType}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex-1 overflow-auto p-2">
        <div className="mb-1 font-medium text-muted-foreground">Dependências</div>
        <ul className="space-y-0.5">
          {(dependencies ?? []).map((dep) => (
            <li key={dep} className="font-mono text-muted-foreground">
              {dep}
            </li>
          ))}
          {(dependencies ?? []).length === 0 && (
            <li className="text-muted-foreground">Sem dependências detectadas</li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default FormulaExplorer;
