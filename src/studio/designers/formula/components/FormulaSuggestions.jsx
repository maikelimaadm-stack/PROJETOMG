/** Formula Suggestions panel (Program 3.2) */
export function FormulaSuggestionsPanel({ suggestionBundle, onApplySuggestion }) {
  const items = suggestionBundle?.suggestions ?? [];

  return (
    <div className="space-y-2 p-2 text-xs">
      <div className="font-medium text-muted-foreground">Sugestões</div>
      {items.length === 0 && <div className="text-muted-foreground">Nenhuma sugestão no momento</div>}
      <ul className="space-y-1">
        {items.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="w-full rounded border border-border px-2 py-1 text-left hover:bg-accent"
              onClick={() => s.token && onApplySuggestion?.(s.token)}
              disabled={!s.token}
            >
              <div className="font-medium">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">{s.detail}</div>
              {s.extensionPoint && (
                <div className="text-[10px] text-primary">Ext: {s.extensionPoint} (futuro)</div>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-border pt-2 text-[10px] text-muted-foreground">
        Pontos de extensão preparados: Formula Assist · AI · NL · Marketplace · Templates
      </div>
    </div>
  );
}

export default FormulaSuggestionsPanel;
