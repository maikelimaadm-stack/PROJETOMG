import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the FILES a module WOULD need, grouped by category. Pure. Every path is a PLAN
 * (`plannedPath`), never written; `generationAllowedNow` is always false. Backend/Prisma
 * files are `futureSlice`-gated.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} file plan
 */
export function createModuleFilePlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};
  const moduleId = String(b.moduleId ?? 'plannedModule').trim();
  const base = `src/modules/${moduleId}`;

  const plan = (plannedPath, category, purpose, required, futureSlice, risk) => ({
    plannedPath,
    category,
    purpose,
    required: required !== false,
    generationAllowedNow: false,
    blockedReason: 'module generation deferred to a dedicated controlled-generation slice',
    futureSlice: futureSlice ?? 'STUDIO MODULE GENERATION (controlled)',
    risk: risk ?? 'low',
  });

  const files = [
    plan(`${base}/domain/${moduleId}Model.js`, 'domain', 'domain model / entity shape', true),
    plan(`${base}/domain/${moduleId}Rules.js`, 'domain', 'domain rules / invariants', false),
    plan(`${base}/application/${moduleId}ReadService.js`, 'application', 'read use-cases', true),
    plan(`${base}/application/${moduleId}Config.js`, 'application', 'ModeloBase1 config wiring', true),
    plan(`${base}/infrastructure/${moduleId}Api.js`, 'infrastructure', 'read API client (future)', true, 'STUDIO MODULE READ SLICE', 'medium'),
    plan(`${base}/infrastructure/${moduleId}Repository.js`, 'infrastructure', 'repository (future)', true, 'STUDIO MODULE READ SLICE', 'medium'),
    plan(`${base}/infrastructure/backend/${moduleId}.route.js`, 'infrastructure', 'backend route (future backend slice only)', false, 'STUDIO MODULE BACKEND SLICE', 'high'),
    plan(`${base}/infrastructure/prisma/${moduleId}.model.planned.md`, 'infrastructure', 'Prisma model DESCRIPTION (future backend slice only)', false, 'STUDIO MODULE BACKEND SLICE', 'high'),
    plan(`${base}/ui/${moduleId}ListPage.jsx`, 'ui', 'list page placeholder (future preview sandbox)', false, 'STUDIO MODULE PREVIEW SANDBOX', 'medium'),
    plan(`${base}/ui/${moduleId}FormPage.jsx`, 'ui', 'form page placeholder (future preview sandbox)', false, 'STUDIO MODULE PREVIEW SANDBOX', 'medium'),
    plan(`src/runtime/__tests__/${moduleId}-module.test.js`, 'tests', 'module contract tests', true),
    plan(`scripts/gates/g423-${moduleId}-module.mjs`, 'gates', 'module scope/safety gate', true),
    plan(`docs/evidence/post-foundation-c-${moduleId}-module/CERTIFICATION-REPORT.md`, 'evidence', 'module certification evidence', true),
    plan(`${base}/diagnostics/${moduleId}Diagnostics.js`, 'diagnostics', 'passive diagnostics', false),
    plan(`${base}/fallback/${moduleId}Fallback.js`, 'fallback', 'fail-closed fallback', false),
    plan(`${base}/contracts/${moduleId}ReadContract.js`, 'contracts', 'certified read contract', true),
  ];

  const categories = [...new Set(files.map((f) => f.category))];
  const core = {
    kind: 'module-file-plan',
    moduleId,
    files,
    fileCount: files.length,
    categories,
    generationAllowedNow: false,
    filesWrittenToModule: false,
    anyFileWritten: false,
    backendPrismaFutureOnly: files.filter((f) => /backend|prisma/i.test(f.plannedPath)).every((f) => f.generationAllowedNow === false),
  };

  return safeCloneGenericModel({ ...core, filePlanDigest: plannerDigest(core) });
}

export default createModuleFilePlan;
