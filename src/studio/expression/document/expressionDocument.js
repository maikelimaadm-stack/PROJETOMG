import { EXPRESSION_DOCUMENT_VERSION } from "../contracts/expressionContracts.js";

/** Expression Document — sole editing representation for expressions (Program 2.3.2) */

export function createExpressionDocument(partial = {}) {
  return Object.freeze({
    documentVersion: EXPRESSION_DOCUMENT_VERSION,
    documentId: partial.documentId ?? `expr.${Date.now()}`,
    source: partial.source ?? "",
    language: partial.language ?? "mak-expression",
    designerId: partial.designerId ?? null,
    metadata: Object.freeze({
      label: partial.metadata?.label ?? null,
      description: partial.metadata?.description ?? null,
      examples: Object.freeze(partial.metadata?.examples ?? []),
      aiHints: Object.freeze(partial.metadata?.aiHints ?? []),
      ...(partial.metadata ?? {}),
    }),
  });
}

export function validateExpressionDocument(doc) {
  const errors = [];
  if (!doc?.documentVersion) errors.push("documentVersion is required.");
  if (typeof doc?.source !== "string") errors.push("source must be a string.");
  return { valid: errors.length === 0, errors };
}

export default createExpressionDocument;
