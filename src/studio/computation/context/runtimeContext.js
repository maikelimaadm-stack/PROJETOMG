/** Runtime Context — Foundation/runtime scope (Program 3.1) */

export function createRuntimeContext(partial = {}) {
  return Object.freeze({
    clienteId: partial.clienteId ?? null,
    empresaId: partial.empresaId ?? null,
    userId: partial.userId ?? null,
    crbVersionHash: partial.crbVersionHash ?? null,
    moduleId: partial.moduleId ?? null,
    record: Object.freeze(partial.record ?? {}),
    recordCollection: partial.recordCollection ?? null,
    trigger: partial.trigger ?? "load",
    diagnosticsLevel: partial.diagnosticsLevel ?? "production",
    snapshot() {
      return Object.freeze({
        clienteId: this.clienteId,
        empresaId: this.empresaId,
        userId: this.userId,
        crbVersionHash: this.crbVersionHash,
        moduleId: this.moduleId,
        record: this.record,
        trigger: this.trigger,
        diagnosticsLevel: this.diagnosticsLevel,
      });
    },
  });
}

export default createRuntimeContext;
