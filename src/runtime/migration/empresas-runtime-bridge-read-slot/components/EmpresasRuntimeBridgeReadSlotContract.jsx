/**
 * Dev-only, READ-ONLY renderer for the Empresas read slot contract. Shows
 * allowed/blocked operations, required inputs, produced outputs, slot consumers,
 * and fallback/rollback/safety. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotContract} [props.contract]
 */
export function EmpresasRuntimeBridgeReadSlotContract({ contract }) {
  const c = contract ?? {};
  const allowed = Array.isArray(c.allowedOperations) ? c.allowedOperations : [];
  const blocked = Array.isArray(c.blockedOperations) ? c.blockedOperations : [];
  const requiredInputs = Array.isArray(c.requiredInputs) ? c.requiredInputs : [];
  const producedOutputs = Array.isArray(c.producedOutputs) ? c.producedOutputs : [];
  const consumers = Array.isArray(c.slotConsumers) ? c.slotConsumers : [];
  const safety = c.safety ?? {};
  return (
    <section className="mak-read-slot-contract" data-testid="empresas-read-slot-contract" aria-readonly="true">
      <h3 className="text-sm font-semibold">Read Slot Contract (candidate)</h3>
      <p className="text-xs">mode: {c.mode ?? 'read_only'} · candidate: {String(c.candidate ?? true)} · dryRunVerified: {String(c.dryRunVerified ?? false)}</p>
      <ul className="text-xs" data-testid="slot-allowed">
        {allowed.map((op) => (<li key={op} data-allowed={op}>allowed: {op}</li>))}
      </ul>
      <ul className="text-xs" data-testid="slot-blocked">
        {blocked.map((op) => (<li key={op} data-blocked={op}>blocked: {op}</li>))}
      </ul>
      <ul className="text-xs" data-testid="slot-inputs">
        {requiredInputs.map((i) => (<li key={i}>requires: {i}</li>))}
      </ul>
      <ul className="text-xs" data-testid="slot-outputs">
        {producedOutputs.map((o) => (<li key={o}>produces: {o}</li>))}
      </ul>
      <ul className="text-xs" data-testid="slot-consumers">
        {consumers.map((s) => (<li key={s}>consumer: {s}</li>))}
      </ul>
      <p className="text-xs" data-testid="slot-safety">
        {`read-only: ${String(safety.readOnly ?? true)} · write-impossible: ${String(safety.writeImpossible ?? true)} · no-bridge-mutation: ${String(safety.noRuntimeBridgeMutation ?? true)} · no-ui-replacement: ${String(safety.noProductionUiReplacement ?? true)} · rollback: ${c.rollback?.featureFlagDefault ?? 'off'}`}
      </p>
    </section>
  );
}

export default EmpresasRuntimeBridgeReadSlotContract;
