/** Official Field Document contract — Program 2.3 + 2.3.1 Smart Authoring */

export const FIELD_DOCUMENT_VERSION = "mak-field-document-v1";

export const DEFAULT_FIELD_ENTITY_ID = "EmpresaCadastro";

export const DEFAULT_FIELD_GROUPS = Object.freeze([
  { groupId: "group.main", label: "Campos personalizados", category: "geral" },
  { groupId: "group.contato", label: "Contato", category: "contato" },
  { groupId: "group.financeiro", label: "Financeiro", category: "financeiro" },
]);

/**
 * @typedef {object} FieldNode
 * @property {string} fieldNodeId
 * @property {string|null} mdpRowId
 * @property {string} fieldId
 * @property {string} fieldName
 * @property {string} entityId
 * @property {string} fieldType
 * @property {string} source
 * @property {string} label
 * @property {boolean} required
 * @property {boolean} readOnly
 * @property {boolean} active
 * @property {boolean} visibleForm
 * @property {boolean} visibleTable
 * @property {number} sortOrder
 * @property {string} [groupId]
 * @property {string|null} [category]
 * @property {string|null} [placeholder]
 * @property {string|null} [helpText]
 * @property {boolean} [useMask]
 * @property {string|null} [maskText]
 * @property {string|number|null} [defaultValue]
 * @property {number|null} [minValue]
 * @property {number|null} [maxValue]
 * @property {number|null} [precision]
 * @property {number|null} [scale]
 * @property {string|null} [smartTemplateId]
 * @property {string|null} [businessTypeId]
 * @property {string|null} [icon]
 * @property {object|null} [presentation]
 * @property {object|null} [validationHints]
 * @property {Array<object>} labels
 * @property {boolean} [_pendingCreate]
 * @property {boolean} [_pendingDelete]
 */

export function createEmptyFieldDocument(partial = {}) {
  const defaultGroups = DEFAULT_FIELD_GROUPS.map((g) => ({ ...g, fields: [] }));
  return Object.freeze({
    documentVersion: FIELD_DOCUMENT_VERSION,
    documentId: partial.documentId ?? "field.draft",
    moduleId: partial.moduleId ?? "empresas",
    entityId: partial.entityId ?? DEFAULT_FIELD_ENTITY_ID,
    metadata: Object.freeze({
      label: partial.metadata?.label ?? "Campos",
      status: partial.metadata?.status ?? "draft",
      smartAuthoring: true,
      ...(partial.metadata ?? {}),
    }),
    groups: Object.freeze(partial.groups ?? defaultGroups),
  });
}

export function validateFieldDocument(doc) {
  const errors = [];
  if (!doc?.documentVersion) errors.push("documentVersion is required.");
  if (!doc?.documentId) errors.push("documentId is required.");
  if (!doc?.moduleId) errors.push("moduleId is required.");
  if (!doc?.entityId) errors.push("entityId is required.");
  if (!Array.isArray(doc?.groups)) errors.push("groups must be an array.");
  return { valid: errors.length === 0, errors };
}

export default createEmptyFieldDocument;
