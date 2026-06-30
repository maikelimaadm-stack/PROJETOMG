export function createBusinessWorkflowSecurityContracts(partial = {}) {
  return Object.freeze({
    bypassForbidden: true,
    projectionOnly: true,
    runtimeReceives: "derived_projection_only",
    businessUserTechnicalAuthoringForbidden: true,
    bpmnExposureForbidden: true,
    studioDesignerBypassForbidden: true,
    ...(partial ?? {}),
  });
}

export default createBusinessWorkflowSecurityContracts;
