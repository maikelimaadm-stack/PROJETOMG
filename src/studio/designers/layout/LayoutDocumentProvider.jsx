import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  createLayoutDocumentStore,
  createLayoutCommandBus,
  validateLayoutDocumentStructure,
  documentToRegistryPayloads,
  createLayoutProject,
} from "./core/layoutCoreSetup.js";
import { registryEntriesToLayoutDocument } from "./document/registryToDocument.js";
import { mdpRegistrySyncLayoutEntries } from "@/studio/services/mdpRegistryClient.js";
import { compileLayoutDocumentPreview } from "./preview/layoutPreviewBridge.js";
import { mdpIntrospect } from "@/studio/services/mdpStudioClient.js";

const LayoutDocumentContext = createContext(null);

export function LayoutDocumentProvider({ children, moduleId, sdk, hub, onValidationChange, onPreviewChange }) {
  const store = useMemo(() => createLayoutDocumentStore(), []);
  const projectRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  const document = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getState(),
    () => store.getState()
  );

  const syncToMdp = async (doc) => {
    const payloads = documentToRegistryPayloads(doc);
    await mdpRegistrySyncLayoutEntries(payloads);
    projectRef.current = createLayoutProject(moduleId, doc);
    hub?.publish?.("layout.document.synced", { documentId: doc.documentId, moduleId: doc.moduleId });
  };

  const commandBus = useMemo(
    () =>
      createLayoutCommandBus({
        store,
        history: sdk.history,
        onAfterExecute: async (doc) => {
          const validation = validateLayoutDocumentStructure(doc);
          onValidationChange?.(validation);
          try {
            await syncToMdp(doc);
            setSyncError(null);
            const preview = await compileLayoutDocumentPreview(doc);
            onPreviewChange?.(preview);
            hub?.publish?.("preview.refreshed", { compileId: preview.compileId, source: "layout-document" });
          } catch (err) {
            setSyncError(err?.message ?? "Sync failed");
          }
        },
      }),
    [store, sdk.history, hub, moduleId, onValidationChange, onPreviewChange]
  );

  useEffect(() => {
    if (!hub) return undefined;
    const unsub = hub.subscribe?.("layout.property.update", (payload) => {
      const componentId = payload?.componentId;
      const propertyId = payload?.propertyId;
      const value = payload?.value;
      if (!componentId || !propertyId) return;
      commandBus.updateProperty(componentId, propertyId, value, "Property Grid");
    });
    return () => unsub?.();
  }, [hub, commandBus]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const intro = await mdpIntrospect(moduleId);
        if (cancelled) return;
        const doc = registryEntriesToLayoutDocument(intro?.registryEntries ?? [], moduleId);
        store.replace(doc);
        projectRef.current = createLayoutProject(moduleId, doc);
        const validation = validateLayoutDocumentStructure(doc);
        onValidationChange?.(validation);
        const preview = await compileLayoutDocumentPreview(doc).catch(() => null);
        if (preview) onPreviewChange?.(preview);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId, store, onValidationChange, onPreviewChange]);

  const value = useMemo(
    () => ({
      store,
      document,
      commandBus,
      project: projectRef.current,
      loading,
      syncError,
      selectedComponentId,
      setSelectedComponentId,
      refreshPreview: () => compileLayoutDocumentPreview(document).then(onPreviewChange),
    }),
    [store, document, commandBus, loading, syncError, selectedComponentId, onPreviewChange]
  );

  return <LayoutDocumentContext.Provider value={value}>{children}</LayoutDocumentContext.Provider>;
}

export function useLayoutDocument() {
  const ctx = useContext(LayoutDocumentContext);
  if (!ctx) throw new Error("useLayoutDocument must be used within LayoutDocumentProvider");
  return ctx;
}

export default LayoutDocumentProvider;
