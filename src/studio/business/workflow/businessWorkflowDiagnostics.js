export function collectBusinessWorkflowDiagnostics(validation, compatibility, projectionValidation) {
  const diagnostics = [
    ...(validation?.diagnostics ?? []),
    ...(compatibility?.diagnostics ?? []),
    ...(projectionValidation?.diagnostics ?? []),
  ];
  return Object.freeze(diagnostics);
}

export default collectBusinessWorkflowDiagnostics;
