import { upsertComplianceRule } from "./fortressStore.js";

export function buildPolicyEnforcementRules(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ enforcements: [] });

  const enforcements = [
    Object.freeze({
      ruleId: `fenf-${groupId}-retention`,
      label: "Retenção exige regra explícita",
      enforced: true,
      because: "Nenhum dado retido sem política registrada.",
    }),
    Object.freeze({
      ruleId: `fenf-${groupId}-purge`,
      label: "Expurgo exige política e auditoria",
      enforced: true,
      because: "Expurgo controlado — decisão humana obrigatória.",
    }),
    Object.freeze({
      ruleId: `fenf-${groupId}-exception`,
      label: "Exceção exige trilha",
      enforced: true,
      because: "Toda exceção registrada e auditável.",
    }),
  ];

  return Object.freeze({ enforcements: Object.freeze(enforcements), explainable: true });
}

export default buildPolicyEnforcementRules;
