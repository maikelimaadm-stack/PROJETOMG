import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_PERSISTENCE_STATES } from '../createStudioPersistenceBoundaryContract.js';

const STATES = new Set(STUDIO_PERSISTENCE_STATES);

/** Allowed forward transitions and what each one requires. */
const ALLOWED_TRANSITIONS = {
  'noPersistence>memoryOnly': { requiredGates: [], requiredApproval: false, requiredEvidence: ['unit-test'] },
  'memoryOnly>localReadOnly': { requiredGates: ['no-network'], requiredApproval: false, requiredEvidence: ['read-parity'] },
  'localReadOnly>localWriteDraft': { requiredGates: ['local-write-gate'], requiredApproval: false, requiredEvidence: ['cleanup-by-id'] },
  'localReadOnly>stagingReadOnly': { requiredGates: ['environment-gate'], requiredApproval: false, requiredEvidence: ['audit'] },
  'stagingReadOnly>stagingWriteControlled': { requiredGates: ['flag', 'rollback'], requiredApproval: false, requiredEvidence: ['plan'] },
  'stagingWriteControlled>productionRead': { requiredGates: ['approval-gate'], requiredApproval: true, requiredEvidence: ['approval'] },
  'productionRead>productionWriteControlled': { requiredGates: ['production-write-policy'], requiredApproval: true, requiredEvidence: ['explicit-production-write-policy'] },
};

/** Extra automatic dangers that are always blocked regardless of states. */
const AUTO_DANGERS = new Set(['migration', 'prisma', 'backend', 'mutationDefault', 'realDataFixture', 'productionSeed', 'schemaAuto']);

/**
 * Classifies a persistence transition. Pure. A jump straight to a write/production
 * state, or any automatic schema/migration/prisma/backend/mutation, is blocked.
 * @param {unknown} transition
 * @returns {{ allowed: boolean, blocked: boolean, requiredGates: string[], requiredApproval: boolean, requiredEvidence: string[], reasons: string[] }}
 */
export function evaluateStudioPersistenceTransition(transition) {
  const t = isGenericModelPlainObject(transition) ? transition : {};
  const from = String(t.from ?? '');
  const to = String(t.to ?? '');
  /** @type {string[]} */ const reasons = [];

  if (typeof t.auto === 'string' && AUTO_DANGERS.has(t.auto)) {
    reasons.push(`automatic ${t.auto} is blocked`);
    return { allowed: false, blocked: true, requiredGates: [], requiredApproval: false, requiredEvidence: [], reasons };
  }
  if (!STATES.has(from)) reasons.push(`unknown from state: ${from}`);
  if (!STATES.has(to)) reasons.push(`unknown to state: ${to}`);

  const key = `${from}>${to}`;
  const spec = ALLOWED_TRANSITIONS[key];
  if (!spec) {
    reasons.push(`transition not allowed: ${key}`);
    return { allowed: false, blocked: true, requiredGates: [], requiredApproval: false, requiredEvidence: [], reasons };
  }
  return { allowed: true, blocked: false, requiredGates: [...spec.requiredGates], requiredApproval: spec.requiredApproval, requiredEvidence: [...spec.requiredEvidence], reasons };
}

const SAFE_TRANSITIONS = Object.keys(ALLOWED_TRANSITIONS).map((k) => {
  const [from, to] = k.split('>');
  return [`allowed ${k}`, { from, to }, true];
});

const BLOCKED_TRANSITIONS = [
  ['noPersistence -> productionWriteControlled', { from: 'noPersistence', to: 'productionWriteControlled' }],
  ['memoryOnly -> productionWriteControlled', { from: 'memoryOnly', to: 'productionWriteControlled' }],
  ['localReadOnly -> productionWriteControlled', { from: 'localReadOnly', to: 'productionWriteControlled' }],
  ['auto migration', { from: 'localReadOnly', to: 'localWriteDraft', auto: 'migration' }],
  ['auto prisma', { from: 'localReadOnly', to: 'localWriteDraft', auto: 'prisma' }],
  ['auto backend', { from: 'localReadOnly', to: 'localWriteDraft', auto: 'backend' }],
  ['mutation default', { from: 'localReadOnly', to: 'localWriteDraft', auto: 'mutationDefault' }],
  ['real data as fixture', { from: 'memoryOnly', to: 'localReadOnly', auto: 'realDataFixture' }],
  ['production seed', { from: 'stagingReadOnly', to: 'stagingWriteControlled', auto: 'productionSeed' }],
  ['schema auto', { from: 'noPersistence', to: 'memoryOnly', auto: 'schemaAuto' }],
].map(([name, tr]) => [name, tr, false]);

/**
 * Runs the persistence transition matrix. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioPersistenceTransitionMatrix(options = {}) {
  void options;
  const scenarios = [...SAFE_TRANSITIONS, ...BLOCKED_TRANSITIONS].map(([name, transition, expectAllowed]) => {
    const r = evaluateStudioPersistenceTransition(transition);
    return {
      name,
      transitionAllowed: r.allowed,
      transitionBlocked: r.blocked,
      expectAllowed: Boolean(expectAllowed),
      matchedExpectation: r.allowed === Boolean(expectAllowed),
      requiredGates: r.requiredGates,
      requiredApproval: r.requiredApproval,
      requiredEvidence: r.requiredEvidence,
      migrationExecuted: false, prismaAccessed: false, mutationExecuted: false, realDataUsed: false,
      reasons: r.reasons.slice(0, 3),
    };
  });
  const mismatches = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-persistence-transition-matrix',
    states: [...STUDIO_PERSISTENCE_STATES],
    scenarios,
    scenarioCount: scenarios.length,
    allMatched: mismatches.length === 0,
    blockers: mismatches,
    warnings: [],
    readiness: mismatches.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioPersistenceTransitionMatrix;
