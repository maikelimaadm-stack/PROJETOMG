/** Official Layout Document contract — Program 2.2 (single editing representation) */

export const LAYOUT_DOCUMENT_VERSION = "mak-layout-document-v1";

/** @typedef {"page"|"section"|"container"|"component"} LayoutNodeKind */

/**
 * @typedef {object} LayoutComponentNode
 * @property {string} componentId
 * @property {string} type
 * @property {Record<string, unknown>} props
 * @property {Array<object>} bindings
 * @property {Array<object>} rules
 * @property {Record<string, unknown>} styles
 * @property {Array<object>} behaviors
 * @property {{ x: number, y: number, width: number, height: number }} [frame]
 */

/**
 * @typedef {object} LayoutContainerNode
 * @property {string} containerId
 * @property {string} type
 * @property {LayoutComponentNode[]} components
 * @property {Record<string, unknown>} styles
 * @property {Array<object>} bindings
 */

/**
 * @typedef {object} LayoutSectionNode
 * @property {string} sectionId
 * @property {string} label
 * @property {LayoutContainerNode[]} containers
 * @property {Array<object>} bindings
 * @property {Array<object>} rules
 */

/**
 * @typedef {object} LayoutPageNode
 * @property {string} pageId
 * @property {string} label
 * @property {LayoutSectionNode[]} sections
 */

/**
 * @typedef {object} LayoutDocument
 * @property {string} documentVersion
 * @property {string} documentId
 * @property {string} moduleId
 * @property {string} [entityId]
 * @property {object} metadata
 * @property {LayoutPageNode[]} pages
 * @property {Array<object>} bindings
 * @property {Array<object>} rules
 * @property {Record<string, unknown>} styles
 * @property {Array<object>} behaviors
 */

export function createEmptyLayoutDocument(partial = {}) {
  return Object.freeze({
    documentVersion: LAYOUT_DOCUMENT_VERSION,
    documentId: partial.documentId ?? "layout.draft",
    moduleId: partial.moduleId ?? "empresas",
    entityId: partial.entityId ?? null,
    metadata: Object.freeze({
      label: partial.metadata?.label ?? "Layout",
      status: partial.metadata?.status ?? "draft",
      layoutKey: partial.metadata?.layoutKey ?? null,
      ...(partial.metadata ?? {}),
    }),
    pages: Object.freeze(partial.pages ?? []),
    bindings: Object.freeze(partial.bindings ?? []),
    rules: Object.freeze(partial.rules ?? []),
    styles: Object.freeze(partial.styles ?? {}),
    behaviors: Object.freeze(partial.behaviors ?? []),
  });
}

export function validateLayoutDocument(doc) {
  const errors = [];
  if (!doc?.documentVersion) errors.push("documentVersion is required.");
  if (!doc?.documentId) errors.push("documentId is required.");
  if (!doc?.moduleId) errors.push("moduleId is required.");
  if (!Array.isArray(doc?.pages)) errors.push("pages must be an array.");
  return { valid: errors.length === 0, errors };
}

export default createEmptyLayoutDocument;
