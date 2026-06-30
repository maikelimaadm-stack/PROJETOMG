/** Studio Context — authoring scope (Program 3.1) */

export function createStudioContext(partial = {}) {
  return Object.freeze({
    clienteId: partial.clienteId ?? null,
    userId: partial.userId ?? null,
    moduleId: partial.moduleId ?? null,
    designerId: partial.designerId ?? "field",
    draftVersionId: partial.draftVersionId ?? null,
    previewRecordId: partial.previewRecordId ?? null,
    diagnosticsLevel: partial.diagnosticsLevel ?? "authoring",
    simulationMode: partial.simulationMode ?? false,
    snapshot() {
      return Object.freeze({
        clienteId: this.clienteId,
        userId: this.userId,
        moduleId: this.moduleId,
        designerId: this.designerId,
        draftVersionId: this.draftVersionId,
        previewRecordId: this.previewRecordId,
        diagnosticsLevel: this.diagnosticsLevel,
        simulationMode: this.simulationMode,
      });
    },
  });
}

export default createStudioContext;
