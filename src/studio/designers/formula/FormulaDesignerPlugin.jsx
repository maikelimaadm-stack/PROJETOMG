import { FormulaDocumentProvider, useFormulaDocument } from "./FormulaDocumentProvider.jsx";
import { FormulaBuilderShell } from "./components/FormulaBuilderShell.jsx";

function FormulaDesignerWorkspaceInner() {
  const {
    loading,
    busy,
    pipeline,
    fields,
    functions,
    selectedField,
    suggestionBundle,
    typeSystemVersion,
    handleInsertToken,
    handleClear,
    handleSampleChange,
    handleApplySuggestion,
  } = useFormulaDocument();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Carregando Formula Builder…
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        Nenhum campo disponível para edição de fórmula. Abra o Field Studio e selecione um campo.
      </div>
    );
  }

  return (
    <FormulaBuilderShell
      pipeline={pipeline}
      fields={fields}
      functions={functions}
      selectedField={selectedField}
      suggestionBundle={suggestionBundle}
      typeSystemVersion={typeSystemVersion}
      onInsertToken={handleInsertToken}
      onClear={handleClear}
      onSampleChange={handleSampleChange}
      onApplySuggestion={handleApplySuggestion}
      busy={busy}
    />
  );
}

/** Formula Builder designer plugin — Program 3.2 */
export function FormulaDesignerPlugin({ moduleId, onValidationChange, onPreviewChange }) {
  return (
    <FormulaDocumentProvider
      moduleId={moduleId}
      onValidationChange={onValidationChange}
      onPreviewChange={onPreviewChange}
    >
      <FormulaDesignerWorkspaceInner />
    </FormulaDocumentProvider>
  );
}

export default FormulaDesignerPlugin;
