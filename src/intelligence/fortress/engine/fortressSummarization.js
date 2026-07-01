import { retrieveFortressByContext } from "./fortressRetrieval.js";
import { FORTRESS_OWNERSHIP } from "./complianceFortressContracts.js";

export function summarizeComplianceFortress(groupId) {
  const r = retrieveFortressByContext(groupId);
  const headline =
    r.complianceDocs.length > 0
      ? `Compliance: ${r.complianceRules.length} regras, ${r.reviews.filter((x) => x.status === "compliant").length} em conformidade`
      : "Fortress de compliance será consolidado quando escopo autorizado estiver ativo.";

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    documentCount: r.complianceDocs.length,
    ruleCount: r.complianceRules.length,
    headline,
    explainable: true,
    ...FORTRESS_OWNERSHIP,
  });
}

export function summarizeRetentionFortress(groupId) {
  const r = retrieveFortressByContext(groupId);
  const headline =
    r.retentionDocs.length > 0
      ? `Retenção: ${r.retentionRules.length} regras, ${r.schedules.length} agendas, ${r.archives.length} arquivos`
      : "Fortress de retenção aguardando escopo autorizado.";

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    documentCount: r.retentionDocs.length,
    ruleCount: r.retentionRules.length,
    scheduleCount: r.schedules.length,
    headline,
    explainable: true,
    retentionRequiresExplicitRule: true,
    purgeRequiresPolicyAndAudit: true,
  });
}

export function summarizeAuditFortress(groupId) {
  const r = retrieveFortressByContext(groupId);
  const headline =
    r.auditDocs.length > 0
      ? `Auditoria: ${r.auditEvents.length} eventos, ${r.auditRules.length} regras ativas`
      : "Fortress de auditoria aguardando escopo autorizado.";

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    documentCount: r.auditDocs.length,
    eventCount: r.auditEvents.length,
    ruleCount: r.auditRules.length,
    headline,
    explainable: true,
    exceptionRequiresAuditTrail: true,
  });
}

export function summarizeFortressEngine(groupId) {
  const compliance = summarizeComplianceFortress(groupId);
  const retention = summarizeRetentionFortress(groupId);
  const audit = summarizeAuditFortress(groupId);

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    headline: `${compliance.ruleCount} regras compliance · ${retention.ruleCount} retenções · ${audit.eventCount} eventos auditados`,
    compliance,
    retention,
    audit,
    explainable: true,
    belongsToPlatform: true,
    ...FORTRESS_OWNERSHIP,
  });
}

export default summarizeFortressEngine;
