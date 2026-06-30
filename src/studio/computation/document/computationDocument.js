import {
  COMPUTATION_DOCUMENT_VERSION,
  COMPUTATION_FIELD_KINDS,
  COMPUTATION_OWNER_TYPES,
  EVALUATION_POLICIES,
} from "../contracts/computationContracts.js";
import { EXPRESSION_AST_VERSION } from "../../expression/contracts/expressionContracts.js";
import { createComputationAstRoot, validateComputationAst } from "../ast/computationAst.js";

/** Computation Document — sole Studio authoring SSOT (Program 3.1) */

function hashContent(payload) {
  const str = JSON.stringify(payload);
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return `h${Math.abs(h).toString(16)}`;
}

function normalizeAst(ast, documentId) {
  if (!ast) return createComputationAstRoot(null);
  if (ast.astVersion === EXPRESSION_AST_VERSION && ast.expression) {
    return createComputationAstRoot(ast.expression, { documentId, metadata: ast.metadata });
  }
  if (ast.astVersion && ast.expression) return ast;
  if (ast.kind) return createComputationAstRoot(ast, { documentId });
  return createComputationAstRoot(null, { documentId });
}

export function createComputationDocument(partial = {}) {
  const ast = normalizeAst(partial.ast, partial.id);
  const body = {
    schemaVersion: COMPUTATION_DOCUMENT_VERSION,
    id: partial.id ?? `comp-${Date.now()}`,
    ownerType: partial.ownerType ?? "field",
    ownerId: partial.ownerId ?? partial.id ?? "unknown",
    moduleId: partial.moduleId ?? "default",
    entityId: partial.entityId ?? "default",
    fieldKind: partial.fieldKind ?? "computed",
    expressionSource: partial.expressionSource ?? null,
    ast,
    dependencies: Object.freeze([...(partial.dependencies ?? [])]),
    evaluationPolicy: partial.evaluationPolicy ?? "lazy",
    typeDescriptor: Object.freeze(partial.typeDescriptor ?? { kind: "unknown" }),
    metadata: Object.freeze(partial.metadata ?? {}),
    revision: partial.revision ?? 1,
  };
  return Object.freeze({
    ...body,
    contentHash: partial.contentHash ?? hashContent(body),
  });
}

export function validateComputationDocument(doc) {
  const errors = [];
  if (!doc?.schemaVersion) errors.push("schemaVersion is required.");
  if (doc?.schemaVersion && doc.schemaVersion !== COMPUTATION_DOCUMENT_VERSION) {
    errors.push(`Invalid schemaVersion: ${doc.schemaVersion}`);
  }
  if (!doc?.id) errors.push("id is required.");
  if (!COMPUTATION_OWNER_TYPES.includes(doc?.ownerType)) {
    errors.push(`Invalid ownerType: ${doc?.ownerType}`);
  }
  if (!COMPUTATION_FIELD_KINDS.includes(doc?.fieldKind)) {
    errors.push(`Invalid fieldKind: ${doc?.fieldKind}`);
  }
  if (!EVALUATION_POLICIES.includes(doc?.evaluationPolicy)) {
    errors.push(`Invalid evaluationPolicy: ${doc?.evaluationPolicy}`);
  }
  const astCheck = validateComputationAst(doc?.ast);
  if (!astCheck.valid) errors.push(...astCheck.errors);
  return { valid: errors.length === 0, ok: errors.length === 0, errors };
}

export default createComputationDocument;
