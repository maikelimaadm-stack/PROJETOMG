/**
 * Group Capability Radar — capability maturity across authorized companies.
 * @see Program 3.22
 */

export function buildGroupCapabilityRadar(groupId, tenantId, maturity, ctx) {
  const tenantCapabilities = (ctx.tenantSummaries ?? []).map((t) =>
    Object.freeze({
      tenantId: t.tenantId,
      label: t.isCurrentTenant ? "Esta empresa" : `Empresa ${String(t.tenantId).slice(-4)}`,
      maturityLevel: t.dna?.maturityLevel ?? t.evolution?.maturityLevel ?? "emerging",
      isCurrentTenant: t.isCurrentTenant,
    })
  );

  return Object.freeze({
    groupId,
    tenantId,
    title: "Radar de capacidades do grupo",
    groupMaturityScore: maturity.averageMaturityScore ?? 0,
    companies: Object.freeze(tenantCapabilities),
    explainable: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildGroupCapabilityRadar;
