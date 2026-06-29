import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  createFieldDocumentStore,
  createFieldCommandBus,
  validateFieldDocumentStructure,
  documentToRegistryPayloads,
  createFieldProject,
} from "./core/fieldCoreSetup.js";
import { dictionaryToFieldDocument } from "./document/dictionaryToDocument.js";
import { mdpFieldList, mdpFieldSyncDocumentFields } from "@/studio/services/mdpFieldClient.js";
import { compileFieldDocumentPreview } from "./preview/fieldPreviewBridge.js";
import { applyFieldSyncResults, buildFieldExplorerTree, collectActiveFields } from "./fieldPropertyFields.js";
import { DEFAULT_FIELD_ENTITY_ID } from "./document/fieldDocumentContracts.js";
import { EDITOR_HUB_EVENTS } from "@/studio/editor/index.js";
import { useWorkspace } from "@/studio/domain/hooks/useWorkspace.js";

const FieldDocumentContext = createContext(null);

export function FieldDocumentProvider({ children, moduleId, sdk, hub, onValidationChange, onPreviewChange }) {
  const store = useMemo(() => createFieldDocumentStore(), []);
  const projectRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);
  const [selectedFieldNodeId, setSelectedFieldNodeId] = useState(null);
  const { setExplorerTree } = useWorkspace();

  const document = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getState(),
    () => store.getState()
  );

  const syncToMdp = async (doc) => {
    const activeFields = collectActiveFields(doc);
    const removedIds = (doc.groups ?? [])
      .flatMap((g) => g.fields ?? [])
      .filter((f) => f._pendingDelete && f.mdpRowId)
      .map((f) => f.mdpRowId);

    const syncResults = await mdpFieldSyncDocumentFields(activeFields, { removedIds });
    const registryPayloads = documentToRegistryPayloads(doc);
    if (registryPayloads?.length) {
      const { mdpRegistrySyncLayoutEntries } = await import("@/studio/services/mdpRegistryClient.js");
      await mdpRegistrySyncLayoutEntries(registryPayloads).catch(() => {});
    }

    const syncedDoc = applyFieldSyncResults(doc, syncResults);
    if (syncedDoc !== doc) store.replace(syncedDoc);

    projectRef.current = createFieldProject(moduleId, store.getState());
    setExplorerTree(buildFieldExplorerTree(store.getState()));

    hub?.publish?.(EDITOR_HUB_EVENTS.DOCUMENT_SYNCED, {
      designerId: "field",
      documentId: doc.documentId,
      moduleId: doc.moduleId,
    });

    return syncResults;
  };

  const commandBus = useMemo(
    () =>
      createFieldCommandBus({
        store,
        history: sdk.history,
        onAfterExecute: async (doc) => {
          const validation = validateFieldDocumentStructure(doc);
          onValidationChange?.(validation);
          setExplorerTree(buildFieldExplorerTree(doc));
          try {
            await syncToMdp(doc);
            setSyncError(null);
            const preview = await compileFieldDocumentPreview(store.getState());
            onPreviewChange?.(preview);
            hub?.publish?.(EDITOR_HUB_EVENTS.PREVIEW_CHANGED, {
              designerId: "field",
              compileId: preview.compileId,
            });
          } catch (err) {
            setSyncError(err?.message ?? "Sync failed");
          }
        },
      }),
    [store, sdk.history, hub, moduleId, onValidationChange, onPreviewChange, setExplorerTree]
  );

  useEffect(() => {
    if (!hub) return undefined;
    const unsub = hub.subscribe?.(EDITOR_HUB_EVENTS.PROPERTY_CHANGE, (payload) => {
      if (payload?.designerId && payload.designerId !== "field") return;
      const fieldNodeId = payload?.targetId ?? payload?.fieldNodeId;
      const propertyId = payload?.propertyId;
      const value = payload?.value;
      if (!fieldNodeId || !propertyId) return;
      commandBus.updateProperty(fieldNodeId, propertyId, value, "Property Grid");
    });
    return () => unsub?.();
  }, [hub, commandBus]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await mdpFieldList({ moduleId, entityId: DEFAULT_FIELD_ENTITY_ID });
        if (cancelled) return;
        const rows = list?.data ?? list?.items ?? list ?? [];
        const doc = dictionaryToFieldDocument(Array.isArray(rows) ? rows : [], moduleId);
        store.replace(doc);
        projectRef.current = createFieldProject(moduleId, doc);
        setExplorerTree(buildFieldExplorerTree(doc));
        const validation = validateFieldDocumentStructure(doc);
        onValidationChange?.(validation);
        const preview = await compileFieldDocumentPreview(doc).catch(() => null);
        if (preview) onPreviewChange?.(preview);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId, store, onValidationChange, onPreviewChange, setExplorerTree]);

  const value = useMemo(
    () => ({
      store,
      document,
      commandBus,
      project: projectRef.current,
      loading,
      syncError,
      selectedFieldNodeId,
      setSelectedFieldNodeId,
      refreshPreview: () => compileFieldDocumentPreview(document).then(onPreviewChange),
    }),
    [store, document, commandBus, loading, syncError, selectedFieldNodeId, onPreviewChange]
  );

  return <FieldDocumentContext.Provider value={value}>{children}</FieldDocumentContext.Provider>;
}

export function useFieldDocument() {
  const ctx = useContext(FieldDocumentContext);
  if (!ctx) throw new Error("useFieldDocument must be used within FieldDocumentProvider");
  return ctx;
}

export default FieldDocumentProvider;
