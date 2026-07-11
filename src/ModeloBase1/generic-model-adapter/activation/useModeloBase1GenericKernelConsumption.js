import { useMemo } from 'react';
import { applyModeloBase1GenericKernelConsumption } from './applyModeloBase1GenericKernelConsumption.js';

/**
 * OPTIONAL React hook that routes an already-applied ModeloBase1 runtime read
 * state through the generic-model kernel, behind flags, with a legacy fallback.
 *
 * This is ADDITIVE and not yet wired into the Empresas/cadcps UI — it is the
 * integration point for a future slice. It performs a pure, synchronous
 * derivation (no effect, no async, no side effect): flag off / beta off returns
 * the original state verbatim; any failure falls back to the original state.
 *
 * @param {import('../../runtime-read-model/types.js').ModeloBase1RuntimeReadState|Object|null} readState
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @param {Function} [options.createAdapter]
 * @returns {{ readState: Object|null, consumptionEnabled: boolean, consumptionApplied: boolean, legacyFallback: boolean, diagnostics: Object, reason: string|null }}
 */
export function useModeloBase1GenericKernelConsumption(readState, options = {}) {
  const moduleId = options && typeof options.moduleId === 'string'
    ? options.moduleId
    : (readState && typeof readState === 'object' && typeof readState.moduleId === 'string' ? readState.moduleId : undefined);
  const env = options ? options.env : undefined;
  const createAdapter = options ? options.createAdapter : undefined;

  return useMemo(() => {
    const result = applyModeloBase1GenericKernelConsumption({ moduleId, readState, env, createAdapter });
    return {
      readState: result.readState,
      consumptionEnabled: result.consumptionEnabled,
      consumptionApplied: result.consumptionApplied,
      legacyFallback: result.legacyFallback,
      diagnostics: result.diagnostics,
      reason: result.reason,
    };
    // createAdapter/env are stable in practice; readState + moduleId drive the derivation.
  }, [readState, moduleId, env, createAdapter]);
}

export default useModeloBase1GenericKernelConsumption;
