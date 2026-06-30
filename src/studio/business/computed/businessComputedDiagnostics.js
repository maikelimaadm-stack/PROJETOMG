export function collectBusinessComputedDiagnostics(validation, compatibility, pipelineValidation) {
  const diagnostics = [
    ...(validation?.diagnostics ?? []),
    ...(compatibility?.diagnostics ?? []),
  ];

  if (pipelineValidation && !pipelineValidation.ok) {
    diagnostics.push({
      code: "PROJECTION_VALIDATION_FAILED",
      message: "Formula/computation projection validation failed.",
      severity: "blocking",
    });
  }

  return Object.freeze(diagnostics);
}

export default collectBusinessComputedDiagnostics;
