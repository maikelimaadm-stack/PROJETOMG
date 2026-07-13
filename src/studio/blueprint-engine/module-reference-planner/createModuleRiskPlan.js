import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Registers the RISKS of the planner and of a future module generation. Pure. Each risk
 * has a mitigation that keeps the current slice contract-only. Descriptive only.
 *
 * @param {Object} [options]
 * @returns {Object} risk plan
 */
export function createModuleRiskPlan(options = {}) {
  void options;

  const risk = (id, description, mitigation, severity) => ({ riskId: id, description, mitigation, severity: severity ?? 'medium' });

  const risks = [
    risk('planner_confused_with_generator', 'planner ser confundido com gerador de módulo', 'moduleGenerated=false; generationAllowedNow=false em todos os planos', 'high'),
    risk('early_src_modules_files', 'criar arquivos em src/modules cedo demais', 'file plan é plannedOnly; nenhum write; gate bloqueia src/modules', 'high'),
    risk('early_route_menu', 'route/menu serem ativados cedo demais', 'routeCreated/menuCreated=false; dev-only/flag/permission gated', 'high'),
    risk('backend_prisma_as_execution', 'backend/Prisma serem planejados como execução', 'backend/prisma futureOnly; allowedNow=false', 'high'),
    risk('persistence_without_readiness', 'persistence real sem readiness', 'realPersistenceBlocked=true; states só planejados', 'high'),
    risk('open_permission', 'permission aberta por padrão', 'defaultDeny/failClosed; só read habilitada', 'high'),
    risk('tenant_bypass', 'tenant bypass', 'tenantRequired=true; admin não contorna tenant', 'high'),
    risk('new_module_before_registry', 'módulo novo antes do registry', 'readyForRealModuleGeneration=false; needs_registry como readiness', 'medium'),
    risk('preview_becomes_production', 'preview virar produção', 'preview futureOnly; productionAllowed=false', 'medium'),
    risk('empresas_rewrite', 'Empresas ser reescrita acidentalmente', 'rewriteEmpresas=false; Empresas referenceOnly', 'high'),
    risk('modelobase2_becomes_production', 'ModeloBase2 experimental virar produção', 'modeloBase2IsProduction=false; experimental only', 'medium'),
    risk('marketplace_before_registry', 'marketplace antes do registry', 'marketplace não planejado; needs_registry primeiro', 'low'),
  ];

  const core = {
    kind: 'module-risk-plan',
    risks,
    riskCount: risks.length,
    highSeverityCount: risks.filter((r) => r.severity === 'high').length,
    allMitigated: risks.every((r) => typeof r.mitigation === 'string' && r.mitigation.length > 0),
  };

  return safeCloneGenericModel({ ...core, riskPlanDigest: plannerDigest(core) });
}

export default createModuleRiskPlan;
