import { useEffect, useMemo, useState } from 'react';
import { applyModeloBase1RuntimeReadModel } from './applyModeloBase1RuntimeReadModel.js';
import { resolveModeloBase1RuntimeReadModel } from './resolveModeloBase1RuntimeReadModel.js';
import { createModeloBase1RuntimeReadFallbackState } from './modeloBase1RuntimeReadFallback.js';

/**
 * React hook that lets the ModeloBase1 engine consume `config.runtimeReadModel`.
 * Returns the applied read state (READ-ONLY) or a safe fallback state.
 *
 * Behavior:
 * - Flag off / model absent / disabled → synchronous fallback (no async work,
 *   `writeBlocked: false`, `betaApplied: false`) — byte-identical engine path.
 * - Flag on / valid → asynchronously resolves + validates + applies the beta
 *   read model; any error falls back safely. `writeBlocked: true` while applied.
 *
 * The hook never writes, never calls the backend/Prisma/fetch, never touches
 * real data or storage.
 *
 * @param {object|null|undefined} config
 * @param {Object} [options]
 * @param {string} [options.writeBlockMessage]
 * @returns {import('./types.js').ModeloBase1RuntimeReadState}
 */
export function useModeloBase1RuntimeReadModel(config, options = {}) {
  const writeBlockMessage = options.writeBlockMessage;
  const resolution = useMemo(() => resolveModeloBase1RuntimeReadModel(config), [config]);
  const moduleId = resolution.readModel?.moduleId
    ?? (config && typeof config === 'object' ? config.moduleId : null)
    ?? null;

  const [state, setState] = useState(() =>
    createModeloBase1RuntimeReadFallbackState({
      moduleId,
      fallbackReason: resolution.present ? 'resolving' : 'runtime-read-model-absent',
      runtimeReadModelPresent: resolution.present,
    }),
  );

  useEffect(() => {
    let cancelled = false;
    // Off / absent / disabled → synchronous fallback; no async, no side effects.
    if (!resolution.present || !resolution.enabled) {
      setState(
        createModeloBase1RuntimeReadFallbackState({
          moduleId,
          fallbackReason: resolution.present ? 'runtime-read-model-disabled' : 'runtime-read-model-absent',
          runtimeReadModelPresent: resolution.present,
        }),
      );
      return () => {
        cancelled = true;
      };
    }
    applyModeloBase1RuntimeReadModel({ config, writeBlockMessage })
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch(() => {
        if (!cancelled) {
          setState(
            createModeloBase1RuntimeReadFallbackState({
              moduleId,
              fallbackReason: 'apply-error',
              runtimeReadModelPresent: true,
              runtimeReadModelValid: true,
            }),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [config, resolution.present, resolution.enabled, moduleId, writeBlockMessage]);

  return state;
}

export default useModeloBase1RuntimeReadModel;
