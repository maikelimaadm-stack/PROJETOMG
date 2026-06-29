import {
  CRB_VERSION,
  CRB_ENGINE_ENTRY_TYPES,
  RUNTIME_BRIDGE_PILOT_MODULES,
} from "./runtimeBridgeConstants.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

/**
 * Validates structural shape of a Compiled Runtime Bundle payload.
 * @param {object} crb
 * @param {object} [options]
 * @param {string} [options.moduleId]
 */
export function validateCrbStructure(crb, options = {}) {
  const errors = [];
  if (!crb || typeof crb !== "object") {
    return { valid: false, errors: ["CRB payload ausente ou inválido."] };
  }

  if (crb.crbVersion !== CRB_VERSION) {
    errors.push(`crbVersion esperado ${CRB_VERSION}, recebido ${crb.crbVersion ?? "undefined"}.`);
  }

  const moduleId = options.moduleId ?? crb.moduleId;
  if (!isNonEmptyString(moduleId)) {
    errors.push("moduleId ausente no CRB.");
  }

  if (!Array.isArray(crb.registry)) {
    errors.push("registry deve ser um array.");
  } else if (RUNTIME_BRIDGE_PILOT_MODULES.includes(moduleId)) {
    const publishedEngineEntries = crb.registry.filter(
      (entry) =>
        entry?.enabled !== false &&
        entry?.status === "published" &&
        CRB_ENGINE_ENTRY_TYPES.includes(entry.entryType)
    );
    if (publishedEngineEntries.length < 1) {
      errors.push("CRB pilot deve conter ao menos uma registry entry publicada para engines.");
    }
  }

  if (!crb.meta || typeof crb.meta !== "object") {
    errors.push("meta ausente no CRB.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * @param {object} cacheEnvelope
 */
export function validateRuntimeBridgeCacheEnvelope(cacheEnvelope) {
  const errors = [];
  if (!cacheEnvelope?.payload) {
    errors.push("Cache envelope sem payload CRB.");
  }
  if (!isNonEmptyString(cacheEnvelope?.integrityHash)) {
    errors.push("integrityHash ausente no cache envelope.");
  }
  const structure = validateCrbStructure(cacheEnvelope?.payload, {
    moduleId: cacheEnvelope?.moduleId,
  });
  return {
    valid: errors.length === 0 && structure.valid,
    errors: [...errors, ...structure.errors],
  };
}

export default validateCrbStructure;
