/** Formula Inspector — types, return, selection metadata (Program 3.2) */
export function FormulaInspector({ pipeline, selectedField, typeSystemVersion }) {
  const inferredType = pipeline?.inferredType ?? "unknown";
  const cost = pipeline?.validation?.costEstimate ?? pipeline?.computationDocument?.evaluationPolicy;

  return (
    <div className="space-y-3 p-2 text-xs">
      <div>
        <div className="font-medium text-muted-foreground">Campo alvo</div>
        <div className="font-mono">{selectedField?.fieldName ?? pipeline?.formulaDocument?.ownerFieldId ?? "—"}</div>
        {selectedField?.label && <div className="text-muted-foreground">{selectedField.label}</div>}
      </div>
      <div>
        <div className="font-medium text-muted-foreground">Tipo inferido</div>
        <div className="font-mono text-primary">{inferredType}</div>
      </div>
      <div>
        <div className="font-medium text-muted-foreground">Retorno esperado</div>
        <div>{describeReturnType(inferredType)}</div>
      </div>
      <div>
        <div className="font-medium text-muted-foreground">Política / custo</div>
        <div className="font-mono">{String(cost ?? "lazy")}</div>
      </div>
      <div>
        <div className="font-medium text-muted-foreground">Type System</div>
        <div className="font-mono text-[10px] text-muted-foreground">{typeSystemVersion ?? "mak-studio-type-system-v1"}</div>
      </div>
      <div>
        <div className="font-medium text-muted-foreground">Ordem de dependências</div>
        <ul className="mt-1 space-y-0.5 font-mono text-muted-foreground">
          {(pipeline?.dependencyOrder ?? []).slice(0, 8).map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function describeReturnType(type) {
  const map = {
    number: "Valor numérico",
    string: "Texto",
    boolean: "Verdadeiro / Falso",
    null: "Nulo",
    unknown: "Aguardando fórmula válida",
    any: "Qualquer tipo",
  };
  return map[type] ?? type;
}

export default FormulaInspector;
