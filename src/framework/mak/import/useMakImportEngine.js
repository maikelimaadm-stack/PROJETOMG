import { useCallback, useMemo, useState } from "react";
import { createMakImportEngine } from "./createMakImportEngine.js";
import { buildMakImportMetadata } from "./buildMakImportMetadata.js";
import { MAK_IMPORT_BACKEND_PENDING_CODE, MAK_IMPORT_STATUS } from "./makImport.constants.js";
import { createMakImportNoopBackendAdapter } from "./createMakImportBackendAdapter.js";

/**
 * Hook de runtime da Import Engine por módulo.
 */
export function useMakImportEngine({
  moduleId,
  metadata = null,
  backendAdapter = null,
} = {}) {
  const engine = useMemo(
    () =>
      createMakImportEngine({
        moduleId,
        metadata: metadata ?? buildMakImportMetadata(),
        backendAdapter: backendAdapter ?? createMakImportNoopBackendAdapter(),
      }),
    [backendAdapter, metadata, moduleId]
  );

  const [status, setStatus] = useState(MAK_IMPORT_STATUS.IDLE);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [backendPending, setBackendPending] = useState(!engine.isBackendAvailable());

  const parseLocalFile = useCallback(
    async (file) => {
      setStatus(MAK_IMPORT_STATUS.PARSING);
      setError(null);
      try {
        const text = await file.text();
        const parsed = engine.parsePreview(text);
        setPreview(parsed);
        engine.writeDraft({ fileName: file.name, preview: parsed, updatedAt: new Date().toISOString() });
        setStatus(MAK_IMPORT_STATUS.MAPPED);
        return parsed;
      } catch (parseError) {
        setError(parseError);
        setStatus(MAK_IMPORT_STATUS.ERROR);
        throw parseError;
      }
    },
    [engine]
  );

  const submitImport = useCallback(
    async (payload = {}) => {
      setStatus(MAK_IMPORT_STATUS.SUBMITTING);
      setError(null);
      try {
        const result = await engine.executeImport(payload);
        setStatus(MAK_IMPORT_STATUS.SUCCESS);
        setBackendPending(false);
        return result;
      } catch (submitError) {
        if (submitError?.code === MAK_IMPORT_BACKEND_PENDING_CODE) {
          setBackendPending(true);
          setStatus(MAK_IMPORT_STATUS.BACKEND_PENDING);
        } else {
          setStatus(MAK_IMPORT_STATUS.ERROR);
        }
        setError(submitError);
        throw submitError;
      }
    },
    [engine]
  );

  const resetImport = useCallback(() => {
    engine.reset();
    setPreview(null);
    setError(null);
    setBackendPending(!engine.isBackendAvailable());
    setStatus(MAK_IMPORT_STATUS.IDLE);
  }, [engine]);

  return {
    engine,
    status,
    preview,
    error,
    backendPending,
    isBackendAvailable: engine.isBackendAvailable(),
    parseLocalFile,
    submitImport,
    resetImport,
  };
}

export default useMakImportEngine;
