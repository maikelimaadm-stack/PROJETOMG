import { upsertComplianceRule } from "./fortressStore.js";

export function buildDataExposureRules(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ rules: [], exposureBlocked: true });

  const rules = ctx.authorizedTenantIds.map((tid) =>
    upsertComplianceRule(
      Object.freeze({
        ruleId: `fexp-${groupId}-${tid}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        tenantId: tid,
        label: "Bloqueio de exposição cruzada",
        summary: "Dados desta empresa não expostos fora do escopo autorizado.",
        status: "active",
        ruleType: "exposure_block",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  return Object.freeze({
    rules: Object.freeze(rules),
    exposureBlocked: false,
    crossTenantMixingForbidden: true,
    explainable: true,
  });
}

export default buildDataExposureRules;
