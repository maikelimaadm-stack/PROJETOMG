/**
 * Group Evolution Timeline — cross-company evolution milestones.
 * @see Program 3.22
 */

export function buildGroupEvolutionTimeline(groupId, tenantId, evolution, ctx) {
  const milestones = (evolution.trends ?? []).map((t) =>
    Object.freeze({
      label: t.isCurrentTenant ? "Esta empresa" : `Empresa ${String(t.tenantId).slice(-4)}`,
      headline: t.evolutionHeadline,
      maturityLevel: t.maturityLevel,
      isCurrentTenant: t.isCurrentTenant,
    })
  );

  return Object.freeze({
    groupId,
    tenantId,
    title: "Linha do tempo de evolução do grupo",
    milestones: Object.freeze(milestones.slice(0, 20)),
    tenantCount: ctx.authorizedTenantIds?.length ?? 0,
    explainable: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildGroupEvolutionTimeline;
