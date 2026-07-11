import { isGenericModelPlainObject } from '../../runtime/generic-model/index.js';
import { MODELOBASE2_RUNTIME_STATES } from './modeloBase2OperationalRuntimeConfig.js';

const DIRTYING = new Set(['appendEntry', 'updateEntry', 'removeEntry', 'updateDraft']);
const NON_MUTATING = new Set(['createSnapshot', 'restoreSnapshot', 'inspectDiagnostics']);

/**
 * A local, headless OPERATIONAL STATE MACHINE (NOT a real workflow/automation).
 * Pure: `transition(currentState, command, context)` computes the next state and
 * whether the command is allowed, without side effects.
 *
 * @param {Object} [options]
 * @returns {Object} state machine
 */
export function createModeloBase2OperationalStateMachine(options = {}) {
  void (isGenericModelPlainObject(options) ? options : {});

  /**
   * @param {string} currentState
   * @param {Object} command A resolved command ({ commandType }).
   * @param {Object} [context] Extra facts (e.g. { validationValid }).
   * @returns {{ currentState: string, nextState: string, transition: string, allowed: boolean, reason: string|null, warnings: string[], blockers: string[] }}
   */
  function transition(currentState, command, context = {}) {
    const state = MODELOBASE2_RUNTIME_STATES.includes(currentState) ? currentState : 'idle';
    const cmd = isGenericModelPlainObject(command) ? command : {};
    const ctx = isGenericModelPlainObject(context) ? context : {};
    const type = cmd.commandType;
    /** @type {string[]} */ const warnings = [];
    /** @type {string[]} */ const blockers = [];

    const out = (nextState, allowed, reason) => ({ currentState: state, nextState, transition: typeof type === 'string' ? type : 'unknown', allowed, reason: reason ?? null, warnings, blockers });

    if (typeof type !== 'string') { blockers.push('command has no commandType'); return out('blocked', false, 'missing-command-type'); }

    switch (type) {
      case 'fallback':
        return out('fallback', true, 'fallback-requested');
      case 'createDraft':
        return out('draft', true, null);
      case 'appendEntry':
      case 'updateEntry':
      case 'removeEntry':
      case 'updateDraft':
        if (state === 'idle') { blockers.push('cannot mutate before createDraft'); return out('blocked', false, 'no-draft'); }
        return out('dirty', true, null);
      case 'validateDraft': {
        if (!DIRTYING.has('validateDraft') && state === 'idle') { blockers.push('nothing to validate'); return out('blocked', false, 'no-draft'); }
        const valid = ctx.validationValid === true;
        return out(valid ? 'valid' : 'invalid', true, valid ? 'valid' : 'invalid');
      }
      case 'saveDraft':
        if (state === 'invalid') { warnings.push('saving an invalid draft locally (allowed with warning)'); return out('saved_local', true, 'saved-invalid-with-warning'); }
        if (state === 'valid' || state === 'dirty' || state === 'saved_local') return out('saved_local', true, null);
        blockers.push(`cannot saveDraft from "${state}"`); return out('blocked', false, 'invalid-transition');
      case 'submitDraft':
        if (state === 'saved_local') return out('submitted_simulated', true, null);
        blockers.push(`submitDraft requires saved_local (was "${state}")`); return out('blocked', false, 'invalid-transition');
      case 'resetDraft':
        return out('reset', true, null);
      default:
        if (NON_MUTATING.has(type)) return out(state, true, 'non-mutating');
        blockers.push(`unknown command "${type}"`); return out('blocked', false, 'unknown-command');
    }
  }

  return {
    kind: 'modelobase2-operational-state-machine',
    states: [...MODELOBASE2_RUNTIME_STATES],
    initialState: 'idle',
    transition,
  };
}

export default createModeloBase2OperationalStateMachine;
