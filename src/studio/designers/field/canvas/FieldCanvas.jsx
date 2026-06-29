import { useCallback } from "react";

const PHASE1_FIELD_TYPES = Object.freeze(["string", "number", "boolean", "date", "text", "select"]);

/** Field list canvas — Phase 1 visual organization (Program 2.3) */
export function FieldCanvas({
  document: fieldDocument,
  selectedFieldNodeId,
  onSelectField,
  commandBus,
}) {
  const fields =
    fieldDocument?.groups?.[0]?.fields?.filter((f) => !f._pendingDelete) ?? [];

  const paletteTypes = PHASE1_FIELD_TYPES;

  const handleAdd = useCallback(
    (fieldType) => {
      commandBus?.addField(fieldType, `Novo ${fieldType}`, null);
    },
    [commandBus]
  );

  const handleMove = useCallback(
    (fieldNodeId, direction) => {
      const idx = fields.findIndex((f) => f.fieldNodeId === fieldNodeId);
      if (idx < 0) return;
      const toIndex = direction === "up" ? Math.max(0, idx - 1) : Math.min(fields.length - 1, idx + 1);
      if (toIndex !== idx) commandBus?.reorderField(fieldNodeId, toIndex);
    },
    [fields, commandBus]
  );

  return (
    <div className="field-canvas flex h-full flex-col bg-muted/10">
      <div className="border-b border-border px-3 py-2">
        <div className="text-xs font-medium text-foreground">Paleta de campos</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {paletteTypes.map((type) => (
            <button
              key={type}
              type="button"
              className="rounded border border-border bg-background px-2 py-1 text-[11px] hover:bg-muted"
              onClick={() => handleAdd(type)}
            >
              + {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="mb-2 text-xs text-muted-foreground">
          {fields.length} campo(s) · entidade {fieldDocument?.entityId}
        </div>
        {fields.length === 0 ? (
          <div className="rounded border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Nenhum campo personalizado. Clique em um tipo acima para criar.
          </div>
        ) : (
          <ul className="space-y-2">
            {fields.map((field, index) => {
              const selected = field.fieldNodeId === selectedFieldNodeId;
              return (
                <li
                  key={field.fieldNodeId}
                  className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-xs ${
                    selected ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/50"
                  }`}
                  onClick={() => onSelectField(field)}
                >
                  <span className="font-mono text-muted-foreground">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{field.label}</div>
                    <div className="text-muted-foreground truncate">
                      {field.fieldName} · {field.fieldType}
                      {field.required ? " · obrigatório" : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="rounded px-1 hover:bg-muted"
                      title="Mover para cima"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(field.fieldNodeId, "up");
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="rounded px-1 hover:bg-muted"
                      title="Mover para baixo"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(field.fieldNodeId, "down");
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="rounded px-1 text-destructive hover:bg-destructive/10"
                      title="Excluir"
                      onClick={(e) => {
                        e.stopPropagation();
                        commandBus?.deleteField(field.fieldNodeId);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FieldCanvas;
