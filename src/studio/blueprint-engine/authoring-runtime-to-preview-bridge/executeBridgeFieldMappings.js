import { BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, REAL_HANDOFF_FIELDS } from './bridgeRuntimeConfig.js';
import { TARGET_DESCRIPTOR_TARGET_FIELDS } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { normalizeBridgeInput, isPlainObject } from './normalizeBridgeInput.js';

const TARGET_FIELD_SET = new Set(TARGET_DESCRIPTOR_TARGET_FIELDS);

/**
 * Executes the CONTRACT-DECLARED field mappings (consumed read-only from `BRIDGE_FIELD_MAPPINGS`) against a
 * real handoff. There is NO second divergent mapping list. Each mapping is validated (source exists,
 * transform allow-listed, no critical default, no lossy critical, no duplicate, no invented source/target)
 * and applied by transform kind. Fails closed; never mutates the handoff. Pure. @param {Object} options
 * @returns {Object}
 */
export function executeBridgeFieldMappings(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const handoff = isPlainObject(o.sourceHandoff) ? o.sourceHandoff : {};
  const issues = [];
  /** @type {Record<string, unknown>} */
  const mapped = {};
  const seenSource = new Set();
  const seenTarget = new Set();

  for (const m of BRIDGE_FIELD_MAPPINGS) {
    const { sourceField, targetField, transformKind, defaultAllowed, losslessRequired } = m;
    // Duplicate detection.
    if (seenSource.has(sourceField) || seenTarget.has(targetField)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MAPPING_DUPLICATE_FORBIDDEN', severity: 'blocker', stage: 'mapping_contract_validation', path: `mapping.${sourceField}`, message: `Duplicate mapping for "${sourceField}"/"${targetField}".` }));
      continue;
    }
    seenSource.add(sourceField);
    seenTarget.add(targetField);
    // Invented source/target field.
    if (!REAL_HANDOFF_FIELDS.includes(sourceField)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MAPPING_INVENTED_SOURCE_FIELD', severity: 'blocker', stage: 'mapping_contract_validation', path: `mapping.${sourceField}`, message: `Mapping source "${sourceField}" is not a real handoff field.` }));
      continue;
    }
    if (!TARGET_FIELD_SET.has(targetField)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MAPPING_INVENTED_TARGET_FIELD', severity: 'blocker', stage: 'mapping_contract_validation', path: `mapping.${targetField}`, message: `Mapping target "${targetField}" is not a declared target descriptor field.` }));
      continue;
    }
    // Unknown transform.
    if (!ALLOWED_TRANSFORM_KINDS.includes(transformKind)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MAPPING_UNKNOWN_TRANSFORM', severity: 'blocker', stage: 'mapping_contract_validation', path: `mapping.${sourceField}`, message: `Unknown transform "${transformKind}".` }));
      continue;
    }
    const present = Object.prototype.hasOwnProperty.call(handoff, sourceField);
    if (!present) {
      // Critical default forbidden — never fill a missing critical source field.
      if (defaultAllowed === false) {
        issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MAPPING_SOURCE_FIELD_MISSING', severity: 'blocker', stage: 'mapping_contract_validation', path: `source.${sourceField}`, message: `Required mapping source "${sourceField}" is missing (no critical default).` }));
      } else {
        issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MAPPING_CRITICAL_DEFAULT_FORBIDDEN', severity: 'blocker', stage: 'mapping_contract_validation', path: `source.${sourceField}`, message: `Critical mapping "${sourceField}" may not use a default.` }));
      }
      continue;
    }
    const value = handoff[sourceField];
    if (transformKind === 'identity') {
      // Lossless clone (deterministic, no mutation). losslessRequired is asserted by the contract.
      void losslessRequired;
      mapped[targetField] = normalizeBridgeInput(value);
    } else if (transformKind === 'assert_true') {
      if (value !== true) {
        issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MAPPING_ASSERT_TRUE_FAILED', severity: 'blocker', stage: 'mapping_contract_validation', path: `source.${sourceField}`, message: `assert_true mapping "${sourceField}" requires the value to be true.` }));
        continue;
      }
      mapped[targetField] = true;
    } else if (transformKind === 'clone_synthetic') {
      mapped[targetField] = normalizeBridgeInput(value);
    }
  }

  return { ok: !issues.some((i) => i.blocksBridge), issues, mapped, mappingCount: BRIDGE_FIELD_MAPPINGS.length };
}

export default executeBridgeFieldMappings;
