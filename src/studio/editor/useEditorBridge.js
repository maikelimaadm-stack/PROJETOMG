import { useEffect, useMemo, useState } from "react";
import { EDITOR_HUB_EVENTS } from "./contracts/editorContracts.js";
import { getEditorCatalog } from "./catalog/editorCatalog.js";

/**
 * Resolves Editor Bridge state for Universal Components from Editor Registry.
 */
export function useEditorBridge({ designerId, hub, isProduction, selection, propertyGridService }) {
  const registry = getEditorCatalog();
  const hasEditor = isProduction && registry.hasDesigner(designerId);
  const bridgeConfig = useMemo(
    () => registry.getDesigner(designerId)?.bridge ?? {},
    [designerId, registry]
  );

  const [editorValidation, setEditorValidation] = useState({ errorCount: 0, warningCount: 0 });
  const [editorPreviewMessage, setEditorPreviewMessage] = useState(null);

  useEffect(() => {
    if (!hasEditor || !hub) return undefined;
    const onValidation = (payload) => {
      if (payload?.designerId && payload.designerId !== designerId) return;
      setEditorValidation(payload ?? { errorCount: 0, warningCount: 0 });
    };
    const onPreview = (payload) => {
      if (payload?.designerId && payload.designerId !== designerId) return;
      setEditorPreviewMessage(payload?.message ?? null);
    };
    const u1 = hub.subscribe?.(EDITOR_HUB_EVENTS.VALIDATION_CHANGED, onValidation);
    const u2 = hub.subscribe?.(EDITOR_HUB_EVENTS.PREVIEW_CHANGED, onPreview);
    return () => {
      u1?.();
      u2?.();
    };
  }, [hasEditor, hub, designerId]);

  const handlePropertyChange = (propertyId, value) => {
    propertyGridService?.publishChange?.({
      designerId,
      targetId: selection.entryId,
      propertyId,
      value,
      source: "property-grid",
    });
  };

  return useMemo(
    () => ({
      hasEditor,
      bridgeConfig,
      editorValidation,
      editorPreviewMessage,
      supportsPropertyEdit: Boolean(bridgeConfig.supportsPropertyEdit),
      propertyEmptyState:
        bridgeConfig.propertyEmptyState ?? "Property Grid — selecione uma entrada",
      inspectorBindingsLabel:
        bridgeConfig.inspectorBindingsLabel ?? "Somente leitura",
      handlePropertyChange,
    }),
    [
      hasEditor,
      bridgeConfig,
      editorValidation,
      editorPreviewMessage,
      designerId,
      selection.entryId,
      propertyGridService,
    ]
  );
}

export default useEditorBridge;
