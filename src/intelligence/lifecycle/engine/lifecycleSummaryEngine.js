export function buildLifecycleSummary(groupId, ctx, lifecycleRules, archiveLifecycles, expungeApprovals, events) {
  const ruleCount = lifecycleRules?.rules?.length ?? 0;
  const archiveCount = archiveLifecycles?.archives?.length ?? 0;
  const pendingApprovals = (expungeApprovals?.approvals ?? []).filter((a) => a.status === "pending_approval").length;
  const eventCount = events?.events?.length ?? 0;

  const headline =
    ctx.authorized && ruleCount > 0
      ? `${ruleCount} políticas · ${archiveCount} elegíveis para arquivo · ${pendingApprovals} aprovações pendentes`
      : "Ciclo de vida aguardando escopo autorizado.";

  return Object.freeze({
    groupId,
    headline,
    lifecycleStatus: ctx.authorized ? "active" : "unavailable",
    ruleCount,
    archiveCount,
    pendingApprovals,
    eventCount,
    expungeAllowed: false,
    explainable: true,
  });
}

export default buildLifecycleSummary;
