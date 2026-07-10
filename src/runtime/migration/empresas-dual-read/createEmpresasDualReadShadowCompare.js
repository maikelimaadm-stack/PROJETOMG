import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createEmpresasMigrationPlan } from '../planning/createEmpresasMigrationPlan.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { createEmpresasLegacyReadSnapshot } from './createEmpresasLegacyReadSnapshot.js';
import { createEmpresasRuntimeV2ReadSnapshot } from './createEmpresasRuntimeV2ReadSnapshot.js';
import { compareEmpresasReadSnapshots } from './compareEmpresasReadSnapshots.js';
import { createEmpresasDualReadDiagnostics } from './empresasDualReadDiagnostics.js';
import { EmpresasDualReadError } from './errors.js';
import {
  isEmpresasDualReadEnabled,
  isEmpresasDualReadProductionBlocked,
  EMPRESAS_DUAL_READ_FLAG,
} from './empresasDualReadConfig.js';

const MODULE_ID = 'empresas';
const NEXT_OK = 'Post-Foundation C — Empresas Guarded Read UI Slice';
const NEXT_DRIFT = 'Post-Foundation C — Empresas Dual Read Drift Resolution';

/** @param {string} code @param {string} message */
function compareError(code, message) {
  return new EmpresasDualReadError(/** @type {any} */ (code), message);
}

/**
 * Builds the Empresas DUAL READ SHADOW COMPARE — a passive, deterministic
 * comparison between a normalized legacy read snapshot and a runtime v2
 * read-only snapshot of Empresas. Off by default; a safe, side-effect-free
 * skipped result when the flag is off; fail-closed in production. When enabled
 * it builds both snapshots, compares them, classifies differences by severity,
 * and recommends the next step (Guarded Read UI Slice when parity/acceptable
 * drift; Drift Resolution when blocked). It NEVER writes, never touches real
 * data or the backend, never replaces the real screen. The write guard stays
 * active. Prototype pollution is blocked; the result is a safe deep copy.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot} [options.legacySnapshot] Injected legacy snapshot.
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot} [options.runtimeV2Snapshot] Injected runtime v2 snapshot.
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @returns {Promise<import('../../types/empresas-dual-read-shadow-compare.js').EmpresasDualReadShadowCompare>}
 */
export async function createEmpresasDualReadShadowCompare(options = {}) {
  validateProjectionInput(options, 0, 'Empresas dual-read compare options', compareError);
  if (!isPlainObject(options)) {
    throw compareError('MAK-L3-EMP-DUALREAD-003', 'createEmpresasDualReadShadowCompare() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasDualReadEnabled(env);
  const productionBlocked = isEmpresasDualReadProductionBlocked(env);

  const writeGuard = createEmpresasReadOnlyWriteGuard({ env });
  const rollback = createEmpresasMigrationPlan().rollback;

  // FLAG OFF (or production-blocked) → skipped, no snapshots, no side effects.
  if (!enabled) {
    const diagnostics = createEmpresasDualReadDiagnostics({ env });
    const skipped = {
      kind: 'empresas-dual-read-shadow-compare',
      moduleId: MODULE_ID,
      moduleName: 'Empresas',
      mode: 'dual_read_shadow_compare',
      enabled: false,
      skipped: true,
      noSideEffects: true,
      productionBlocked,
      source: 'skipped',
      currentRuntime: 'legacy',
      targetRuntime: 'runtime-v2',
      legacySnapshot: null,
      runtimeV2Snapshot: null,
      differences: [],
      summary: emptySummary(),
      diagnostics,
      readiness: { status: 'skipped', canAdvance: false },
      rollback,
      blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
      nextAllowedStep: NEXT_OK,
      warnings: [productionBlocked ? 'production blocked — fails closed' : `flag ${EMPRESAS_DUAL_READ_FLAG} off — compare skipped`],
      limitations: limitations(),
      evidence: evidenceLinks(),
    };
    return finalize(skipped, writeGuard);
  }

  // FLAG ON → build both snapshots and compare.
  const legacySnapshot = options.legacySnapshot ?? await createEmpresasLegacyReadSnapshot({ descriptor: options.descriptor });
  const runtimeV2Snapshot = options.runtimeV2Snapshot ?? await createEmpresasRuntimeV2ReadSnapshot({ env, descriptor: options.descriptor });
  const comparison = await compareEmpresasReadSnapshots({ legacySnapshot, runtimeV2Snapshot });
  const summary = comparison.summary;

  const blocked = summary.parityStatus === 'blocked';
  const nextAllowedStep = blocked ? NEXT_DRIFT : NEXT_OK;
  const diagnostics = createEmpresasDualReadDiagnostics({ env, legacySnapshot, runtimeV2Snapshot, summary, writeGuardActive: true });

  const model = {
    kind: 'empresas-dual-read-shadow-compare',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    mode: 'dual_read_shadow_compare',
    enabled: true,
    skipped: false,
    noSideEffects: true,
    productionBlocked: false,
    source: 'controlled-dev-dataset',
    currentRuntime: 'legacy',
    targetRuntime: 'runtime-v2',
    legacySnapshot,
    runtimeV2Snapshot,
    differences: comparison.differences,
    summary,
    diagnostics,
    readiness: {
      status: blocked ? 'drift-resolution-required' : 'ready-for-guarded-read-ui',
      canAdvance: !blocked,
      parityStatus: summary.parityStatus,
    },
    rollback,
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    nextAllowedStep,
    warnings: blocked ? ['blocking/critical differences present — drift resolution required before UI exposure'] : [],
    limitations: limitations(),
    evidence: evidenceLinks(),
  };
  return finalize(model, writeGuard);
}

/**
 * Deep-copies the plain compare data and re-attaches the live write guard,
 * whose `attempt()` function would be dropped by JSON clone.
 * @param {Record<string, unknown>} model
 * @param {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} writeGuard
 */
function finalize(model, writeGuard) {
  const cloned = /** @type {any} */ (safeClone(model));
  cloned.writeGuard = writeGuard;
  // Re-attach the live runtime v2 snapshot write guard too, when present.
  if (cloned.runtimeV2Snapshot && isPlainObject(cloned.runtimeV2Snapshot)) {
    cloned.runtimeV2Snapshot.writeGuard = writeGuard;
  }
  return cloned;
}

function emptySummary() {
  return { totalDifferences: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, infoCount: 0, blockingCount: 0, parityStatus: 'parity' };
}

function limitations() {
  return [
    'read-only compare — never saves/edits/deletes real data',
    'mock/controlled data only — no real data, no backend, no Prisma/MMM',
    'never replaces the real Empresas screen',
    'never becomes the source of truth',
    'does not remove or alter the legacy runtime',
    'reversible by feature flag off',
  ];
}

function evidenceLinks() {
  return [
    'docs/evidence/post-foundation-c-empresas-dual-read-shadow-compare/DUAL-READ-COMPARE-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-dual-read-shadow-compare/DIFFERENCE-MODEL-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-dual-read-shadow-compare/ROLLBACK-VALIDATION.md',
  ];
}
