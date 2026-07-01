export function buildLifecycleControlCenter(groupId, ctx, summary, registries) {
  if (!ctx.authorized) {
    return Object.freeze({
      available: false,
      reason: ctx.reason ?? "Centro de controle indisponível.",
    });
  }

  return Object.freeze({
    available: true,
    groupId,
    headline: summary?.headline ?? "Centro de controle de ciclo de vida",
    lifecycleStatus: summary?.lifecycleStatus ?? "active",
    pendingApprovals: (registries.expungeApprovals?.approvals ?? []).filter((a) => a.status === "pending_approval").length,
    activeHolds: (registries.holdEnforcements?.enforcements ?? []).filter((h) => h.active).length,
    archivedCount: (registries.archiveLifecycles?.archives ?? []).length,
    expungeBlocked: registries.expungeExecutions?.expungeAllowed === false,
    complianceStatus: registries.compliance?.records?.[0]?.status ?? "compliant",
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildLifecycleControlCenter;
