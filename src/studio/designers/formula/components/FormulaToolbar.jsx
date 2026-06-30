import { FORMULA_OPERATORS } from "../contracts/formulaContracts.js";

/** Formula Toolbar — visual insert actions (Program 3.2) */
export function FormulaToolbar({ onInsertToken, onClear, disabled }) {
  const operators = FORMULA_OPERATORS.filter((op) => !["(", ")"].includes(op));
  const parens = ["(", ")"];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-2 py-1.5">
      <span className="mr-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Inserir</span>
      {operators.map((op) => (
        <button
          key={op}
          type="button"
          disabled={disabled}
          className="rounded border border-border bg-background px-2 py-0.5 text-xs hover:bg-accent disabled:opacity-50"
          onClick={() => onInsertToken?.({ kind: "operator", op })}
        >
          {op}
        </button>
      ))}
      {parens.map((p) => (
        <button
          key={p}
          type="button"
          disabled={disabled}
          className="rounded border border-border bg-background px-2 py-0.5 text-xs hover:bg-accent disabled:opacity-50"
          onClick={() => onInsertToken?.({ kind: "paren", value: p })}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={disabled}
        className="ml-auto rounded border border-destructive/40 px-2 py-0.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
        onClick={() => onClear?.()}
      >
        Limpar
      </button>
    </div>
  );
}

export default FormulaToolbar;
