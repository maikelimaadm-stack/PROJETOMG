/** Business workflow assignments — responsáveis em linguagem de negócio */
export function createBusinessWorkflowAssignments(processRef = {}, partial = {}) {
  const approvers = partial.approvers ?? processRef.approvers ?? [{ role: "aprovador", label: "Aprovador responsável" }];
  return Object.freeze(
    approvers.map((entry, index) =>
      Object.freeze({
        assignmentId: entry.assignmentId ?? `assign-${index + 1}`,
        role: entry.role ?? "aprovador",
        label: entry.label ?? entry.role ?? "Responsável",
        canApprove: entry.canApprove !== false,
        canReject: entry.canReject !== false,
        canReturn: entry.canReturn !== false,
        canDelegate: entry.canDelegate === true,
      })
    )
  );
}

export default createBusinessWorkflowAssignments;
