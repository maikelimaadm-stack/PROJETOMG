import { FormulaToolbar } from "./FormulaToolbar.jsx";
import { FormulaEditor } from "./FormulaEditor.jsx";
import { FormulaExplorer } from "./FormulaExplorer.jsx";
import { FormulaInspector } from "./FormulaInspector.jsx";
import { FormulaPreview } from "./FormulaPreview.jsx";
import { FormulaDiagnostics } from "./FormulaDiagnostics.jsx";
import { FormulaSuggestionsPanel } from "./FormulaSuggestions.jsx";
import { FormulaValidationPanel } from "./FormulaValidationPanel.jsx";

/** Formula Builder Shell — official visual authoring layout (Program 3.2) */
export function FormulaBuilderShell({
  pipeline,
  fields,
  functions,
  selectedField,
  suggestionBundle,
  typeSystemVersion,
  onInsertToken,
  onClear,
  onSampleChange,
  onApplySuggestion,
  busy,
}) {
  const formulaDoc = pipeline?.formulaDocument;

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <h2 className="text-sm font-semibold">Formula Builder</h2>
          <p className="text-[10px] text-muted-foreground">Authoring visual — Computation Engine exclusivo</p>
        </div>
        {busy && <span className="text-[10px] text-muted-foreground">Atualizando…</span>}
      </header>
      <FormulaToolbar onInsertToken={onInsertToken} onClear={onClear} disabled={busy} />
      <div className="grid min-h-0 flex-1 grid-cols-12 grid-rows-[1fr_auto] gap-0">
        <aside className="col-span-2 row-span-1 overflow-hidden border-r border-border">
          <FormulaExplorer
            fields={fields}
            functions={functions}
            dependencies={pipeline?.dependencies}
            onInsertToken={onInsertToken}
          />
        </aside>
        <main className="col-span-6 row-span-1 overflow-hidden border-r border-border">
          <FormulaEditor
            expressionSource={formulaDoc?.expressionSource}
            tokens={formulaDoc?.tokens}
            onInsertConstant={onInsertToken}
            disabled={busy}
          />
        </main>
        <aside className="col-span-4 row-span-1 overflow-auto">
          <FormulaInspector pipeline={pipeline} selectedField={selectedField} typeSystemVersion={typeSystemVersion} />
          <FormulaPreview
            pipeline={pipeline}
            sampleVariables={formulaDoc?.sampleVariables}
            onSampleChange={onSampleChange}
          />
        </aside>
        <footer className="col-span-12 grid grid-cols-3 gap-0 border-t border-border">
          <div className="border-r border-border">
            <FormulaValidationPanel pipeline={pipeline} />
          </div>
          <div className="border-r border-border">
            <FormulaDiagnostics pipeline={pipeline} />
          </div>
          <div>
            <FormulaSuggestionsPanel suggestionBundle={suggestionBundle} onApplySuggestion={onApplySuggestion} />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default FormulaBuilderShell;
