export function validateCapabilities(capabilityResolution, intentDocument) {
  const diagnostics = [...(capabilityResolution.diagnostics ?? [])];

  if (!capabilityResolution.resolved?.length) {
    diagnostics.push({
      code: "CAP_NONE",
      severity: "blocking",
      message: "No capabilities resolved for this intent.",
    });
  }

  for (const comp of intentDocument.computations ?? []) {
    if (!comp.expressionSource?.trim()) {
      diagnostics.push({
        code: "COMP_EXPR_EMPTY",
        severity: "blocking",
        message: "Computation expression is required.",
      });
    }
  }

  for (const proc of intentDocument.processes ?? []) {
    if (!proc.processId && !proc.ownerProcessId) {
      diagnostics.push({
        code: "PROC_ID_EMPTY",
        severity: "blocking",
        message: "Process reference requires a process id.",
      });
    }
  }

  const blocking = diagnostics.some((d) => d.severity === "blocking");

  return Object.freeze({
    ok: !blocking && capabilityResolution.ok !== false,
    valid: !blocking,
    diagnostics: Object.freeze(diagnostics),
  });
}

export default validateCapabilities;
