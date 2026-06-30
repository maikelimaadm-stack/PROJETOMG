import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  applyFormulaDocumentEdit,
  createFormulaDocumentFromField,
  getFormulaComputationEngine,
  listFormulaFields,
  listFormulaFunctions,
} from "./core/formulaCoreSetup.js";
import { buildFormulaSuggestions } from "./core/formulaSuggestions.js";
import { mdpFieldList } from "@/studio/services/mdpFieldClient.js";
import { dictionaryToFieldDocument } from "../field/document/dictionaryToDocument.js";
import { collectActiveFields } from "../field/fieldPropertyFields.js";
import { DEFAULT_FIELD_ENTITY_ID } from "../field/document/fieldDocumentContracts.js";

const FormulaDocumentContext = createContext(null);

export function FormulaDocumentProvider({ children, moduleId, onValidationChange, onPreviewChange }) {
  const [searchParams] = useSearchParams();
  const fieldNodeId = searchParams.get("fieldNodeId");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pipeline, setPipeline] = useState(null);
  const [fieldDocument, setFieldDocument] = useState(null);
  const [selectedField, setSelectedField] = useState(null);

  const engine = useMemo(() => getFormulaComputationEngine(), []);
  const typeSystemVersion = engine.typeSystem?.version ?? "mak-studio-type-system-v1";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await mdpFieldList(moduleId);
        const doc = dictionaryToFieldDocument({
          moduleId,
          entityId: DEFAULT_FIELD_ENTITY_ID,
          rows,
        });
        if (cancelled) return;
        setFieldDocument(doc);
        const fields = collectActiveFields(doc);
        const target = fieldNodeId
          ? fields.find((f) => f.fieldNodeId === fieldNodeId) ?? fields[0]
          : fields[0];
        setSelectedField(target ?? null);
        if (target) {
          const initial = createFormulaDocumentFromField(target, doc);
          setPipeline(initial);
          onValidationChange?.(initial.validation);
          onPreviewChange?.(initial.preview);
        }
      } catch {
        if (!cancelled) {
          setFieldDocument(null);
          setPipeline(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId, fieldNodeId, onValidationChange, onPreviewChange]);

  const applyEdit = useCallback(
    async (edit) => {
      if (!pipeline?.formulaDocument) return;
      setBusy(true);
      try {
        const next = applyFormulaDocumentEdit(pipeline.formulaDocument, edit);
        setPipeline(next);
        onValidationChange?.(next.validation);
        onPreviewChange?.(next.preview);
      } finally {
        setBusy(false);
      }
    },
    [pipeline?.formulaDocument, onValidationChange, onPreviewChange]
  );

  const handleInsertToken = useCallback(
    (token) => applyEdit({ type: "insertToken", token }),
    [applyEdit]
  );

  const handleClear = useCallback(() => applyEdit({ type: "clear" }), [applyEdit]);

  const handleSampleChange = useCallback(
    (name, value) => applyEdit({ type: "setSampleVariable", name, value }),
    [applyEdit]
  );

  const suggestionBundle = useMemo(
    () => buildFormulaSuggestions(pipeline?.formulaDocument, fieldDocument, pipeline),
    [pipeline, fieldDocument]
  );

  const value = useMemo(
    () => ({
      loading,
      busy,
      pipeline,
      fieldDocument,
      selectedField,
      fields: listFormulaFields(fieldDocument ?? { groups: [] }),
      functions: listFormulaFunctions(),
      suggestionBundle,
      typeSystemVersion,
      handleInsertToken,
      handleClear,
      handleSampleChange,
      handleApplySuggestion: handleInsertToken,
    }),
    [
      loading,
      busy,
      pipeline,
      fieldDocument,
      selectedField,
      suggestionBundle,
      typeSystemVersion,
      handleInsertToken,
      handleClear,
      handleSampleChange,
    ]
  );

  return <FormulaDocumentContext.Provider value={value}>{children}</FormulaDocumentContext.Provider>;
}

export function useFormulaDocument() {
  const ctx = useContext(FormulaDocumentContext);
  if (!ctx) throw new Error("useFormulaDocument must be used within FormulaDocumentProvider");
  return ctx;
}

export default FormulaDocumentProvider;
