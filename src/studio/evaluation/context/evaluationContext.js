import { buildEvaluationMetadata } from "../metadata/evaluationMetadata.js";

/** Evaluation Context — variables, scope, bindings (Program 2.3.5) */

export function createEvaluationContext(partial = {}) {
  const variables = new Map(Object.entries(partial.variables ?? {}));
  const bindings = new Map(Object.entries(partial.bindings ?? {}));

  return Object.freeze({
    sessionId: partial.sessionId ?? null,
    designerId: partial.designerId ?? "studio",
    setVariable(name, value, typeHint = "unknown") {
      variables.set(name, { value, typeHint });
    },
    getVariable(name) {
      return variables.get(name)?.value ?? undefined;
    },
    getVariableType(name) {
      return variables.get(name)?.typeHint ?? "unknown";
    },
    listVariables() {
      return [...variables.keys()];
    },
    bind(key, value) {
      bindings.set(key, value);
    },
    getBinding(key) {
      return bindings.get(key);
    },
    snapshot() {
      return Object.freeze({
        variables: Object.freeze(Object.fromEntries([...variables.entries()].map(([k, v]) => [k, v.value]))),
        bindings: Object.freeze(Object.fromEntries(bindings)),
        metadata: buildEvaluationMetadata({ cacheable: true }),
      });
    },
  });
}

export default createEvaluationContext;
