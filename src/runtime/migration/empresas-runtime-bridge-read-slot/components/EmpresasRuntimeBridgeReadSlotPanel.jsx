import { EmpresasRuntimeBridgeReadSlotStatus } from './EmpresasRuntimeBridgeReadSlotStatus.jsx';
import { EmpresasRuntimeBridgeReadSlotContract } from './EmpresasRuntimeBridgeReadSlotContract.jsx';
import { EmpresasRuntimeBridgeReadSlotPayload } from './EmpresasRuntimeBridgeReadSlotPayload.jsx';

/**
 * Dev-only, READ-ONLY panel for the Empresas runtime bridge read slot candidate.
 * Given a candidate MODEL (from `createEmpresasRuntimeBridgeReadSlotCandidate`),
 * it renders a safe fallback when off/skipped, and otherwise the status +
 * contract + payload summary + payload validation + mount plan + blockers/
 * warnings. It has NO functional save/edit/delete, NO onClick/onSubmit/onChange
 * with a side effect, never calls the backend, never touches storage, never
 * mounts anything. Pure model → markup.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotCandidateModel} [props.model]
 */
export function EmpresasRuntimeBridgeReadSlotPanel({ model }) {
  if (!model || model.enabled !== true || model.skipped === true) {
    return (
      <section className="mak-read-slot-fallback" data-testid="empresas-read-slot-fallback" data-dev-only="true">
        <p className="text-xs">Empresas Runtime Bridge Read Slot Candidate desligado (dev-only, opt-in).</p>
      </section>
    );
  }

  const v = model.payloadValidation ?? {};
  const plan = model.mountPlan ?? {};
  const blockers = Array.isArray(model.blockers) ? model.blockers : [];
  const warnings = Array.isArray(model.warnings) ? model.warnings : [];

  return (
    <section className="mak-read-slot-panel" data-testid="empresas-read-slot-panel" data-dev-only="true" aria-readonly="true">
      <header className="mak-read-slot-header">
        <h2 className="text-base font-semibold">Empresas — Runtime Bridge Read Slot Candidate (dev-only)</h2>
      </header>
      <EmpresasRuntimeBridgeReadSlotStatus model={model} />
      <EmpresasRuntimeBridgeReadSlotContract contract={model.readSlotContract} />
      <EmpresasRuntimeBridgeReadSlotPayload payload={model.readSlotPayload} />
      <section className="mak-read-slot-validation" data-testid="empresas-read-slot-validation">
        <p className="text-xs">{`payload valid: ${String(v.valid ?? false)} · score: ${v.score ?? 0} · errors: ${(Array.isArray(v.errors) ? v.errors.length : 0)}`}</p>
      </section>
      <section className="mak-read-slot-mount" data-testid="empresas-read-slot-mount">
        <p className="text-xs">{`wouldMount: ${String(plan.wouldMount ?? false)} · mountTarget: ${plan.mountTarget ?? 'dev_preview_only'} · futureMountTarget: ${plan.futureMountTarget ?? 'runtime_bridge_read_slot'} · mountedAnythingReal: ${String(plan.mountedAnythingReal ?? false)}`}</p>
      </section>
      {blockers.length > 0 ? (
        <ul className="mak-read-slot-blockers text-xs" data-testid="empresas-read-slot-blockers">
          {blockers.map((b, i) => (<li key={`b-${i}`}>blocker: {b}</li>))}
        </ul>
      ) : null}
      {warnings.length > 0 ? (
        <ul className="mak-read-slot-warnings text-xs" data-testid="empresas-read-slot-warnings">
          {warnings.map((w, i) => (<li key={`w-${i}`}>warning: {w}</li>))}
        </ul>
      ) : null}
    </section>
  );
}

export default EmpresasRuntimeBridgeReadSlotPanel;
