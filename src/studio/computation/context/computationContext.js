/** Computation Context — execution-local facade (Program 3.1) */

export function createComputationContext(partial = {}) {
  const variables = new Map(Object.entries(partial.variables ?? {}));

  const ctx = {
    studio: partial.studio ?? null,
    runtime: partial.runtime ?? null,
    typeSystem: partial.typeSystem ?? null,
    cache: partial.cache ?? null,
    diagnostics: partial.diagnostics ?? null,
    profiler: partial.profiler ?? null,
    functionCatalog: partial.functionCatalog ?? null,
    abortSignal: partial.abortSignal ?? null,
    getVariable(name) {
      return variables.get(name);
    },
    setVariable(name, value) {
      variables.set(name, value);
    },
    listVariables() {
      return [...variables.keys()];
    },
    snapshot() {
      return Object.freeze({
        studio: this.studio?.snapshot?.() ?? this.studio,
        runtime: this.runtime?.snapshot?.() ?? this.runtime,
        variables: Object.fromEntries(variables),
      });
    },
  };

  return Object.freeze(ctx);
}

export default createComputationContext;
