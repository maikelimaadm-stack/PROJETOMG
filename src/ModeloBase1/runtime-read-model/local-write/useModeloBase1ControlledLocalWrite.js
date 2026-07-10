import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createModeloBase1LocalWriteSession } from './createModeloBase1LocalWriteUiState.js';

/**
 * React hook that ACTIVATES controlled local write on the ModeloBase1 beta UI.
 * It wraps the React-free session core: when the activation flags are on (beta +
 * plan + activation), it exposes local, in-memory operations that drive a LOCAL
 * DRAFT; when off, it returns a read-only fallback state and the screen behaves
 * as before.
 *
 * It NEVER writes to a backend/Prisma, never calls fetch, never persists to
 * storage, never touches the runtime bridge, never mutates the original read
 * state. `submitDraft` is a simulated submit (`sent: false`).
 *
 * @param {Object} [options]
 * @param {Object} [options.config] The ModeloBase1 config (for moduleId).
 * @param {Object} [options.readState] The applied runtime read state.
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function useModeloBase1ControlledLocalWrite(options = {}) {
  const { config, readState, env } = options;
  const moduleId = options.moduleId
    ?? (readState && typeof readState === 'object' ? readState.moduleId : null)
    ?? (config && typeof config === 'object' ? config.moduleId : null)
    ?? undefined;

  // Recreate the session when the read state / module identity changes.
  const session = useMemo(
    () => createModeloBase1LocalWriteSession({ readState, moduleId, env }),
    [readState, moduleId, env],
  );
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [uiState, setUiState] = useState(() => session.getUiState());
  useEffect(() => {
    setUiState(session.getUiState());
  }, [session]);

  const runAndSync = useCallback((run) => {
    const res = run(sessionRef.current);
    setUiState(sessionRef.current.getUiState());
    return res;
  }, []);

  const operations = useMemo(() => ({
    createRow: (payload) => runAndSync((s) => s.createRow(payload)),
    updateRow: (id, payload) => runAndSync((s) => s.updateRow(id, payload)),
    deleteRow: (id) => runAndSync((s) => s.deleteRow(id)),
    saveDraft: () => runAndSync((s) => s.saveDraft()),
    submitDraft: () => runAndSync((s) => s.submitDraft()),
    resetDraft: () => runAndSync((s) => s.resetDraft()),
  }), [runAndSync]);

  return {
    enabled: session.activation.activationRequested === true,
    activationApplied: uiState.activationApplied === true,
    localOnly: true,
    readOnlyFallback: uiState.readOnlyFallback !== false,
    rows: uiState.rows,
    form: uiState.form,
    localDraft: uiState.localDraft,
    localRowCount: uiState.localRowCount,
    operationCount: uiState.operationCount,
    hasLocalChanges: uiState.hasLocalChanges,
    operations,
    diagnostics: uiState.diagnostics,
    fallback: { available: true, reason: session.activation.reason },
    reset: operations.resetDraft,
  };
}

export default useModeloBase1ControlledLocalWrite;
