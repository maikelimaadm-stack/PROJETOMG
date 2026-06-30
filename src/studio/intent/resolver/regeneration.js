import { RESOLVER_RESULT_VERSION } from "../contracts/intentContracts.js";

export function diffResolverResults(previous, next) {
  if (!previous || !next) {
    return Object.freeze({ kind: "full", changed: true, fields: Object.freeze(["all"]) });
  }

  const fields = [];
  const prevExpr = previous.formulaDocument?.expressionSource ?? "";
  const nextExpr = next.formulaDocument?.expressionSource ?? "";
  if (prevExpr !== nextExpr) fields.push("expressionSource");
  if (previous.intentDocument?.revision !== next.intentDocument?.revision) fields.push("intentRevision");

  return Object.freeze({
    kind: fields.length ? "incremental" : "none",
    changed: fields.length > 0,
    fields: Object.freeze(fields),
  });
}

export function prepareRollback(session, priorResult) {
  return Object.freeze({
    schemaVersion: "mak-resolver-rollback-v1",
    prepared: Boolean(priorResult),
    targetSessionId: session.resolverSessionId,
    priorSessionId: priorResult?.session?.resolverSessionId ?? null,
    priorDerivationId: priorResult?.derivationDocument?.derivationId ?? null,
    policy: priorResult?.metadata?.rollbackPolicy ?? "allowed",
    status: "prepared",
  });
}

export function resolveIncremental(previousContext, intentDocument, resolveFn) {
  const diff = diffResolverResults(previousContext?.result, null);
  if (!diff.changed && previousContext?.result) {
    return Object.freeze({
      ...previousContext.result,
      incremental: true,
      reused: true,
    });
  }
  return resolveFn(intentDocument, { mode: "incremental", prior: previousContext });
}

export function createResolverResult(partial) {
  return Object.freeze({
    schemaVersion: RESOLVER_RESULT_VERSION,
    ...partial,
  });
}

export default diffResolverResults;
