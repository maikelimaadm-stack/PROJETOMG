/**
 * Dev-only, READ-ONLY renderer for the Empresas runtime bridge read contract.
 * Shows allowed/blocked operations, required inputs, produced outputs, and the
 * fallback/rollback/safety guarantees. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasRuntimeBridgeReadContract} [props.contract]
 */
export function EmpresasRuntimeBridgeDryRunContract({ contract }) {
  const c = contract ?? {};
  const allowed = Array.isArray(c.allowedOperations) ? c.allowedOperations : [];
  const blocked = Array.isArray(c.blockedOperations) ? c.blockedOperations : [];
  const requiredInputs = Array.isArray(c.requiredInputs) ? c.requiredInputs : [];
  const producedOutputs = Array.isArray(c.producedOutputs) ? c.producedOutputs : [];
  const safety = c.safety ?? {};
  return (
    <section className="mak-bridge-dry-run-contract" data-testid="empresas-bridge-dry-run-contract" aria-readonly="true">
      <h3 className="text-sm font-semibold">Bridge Read Contract (dry run)</h3>
      <p className="text-xs">mode: {c.mode ?? 'read_only'} · dryRun: {String(c.dryRun ?? true)}</p>
      <ul className="text-xs" data-testid="bridge-allowed">
        {allowed.map((op) => (<li key={op} data-allowed={op}>allowed: {op}</li>))}
      </ul>
      <ul className="text-xs" data-testid="bridge-blocked">
        {blocked.map((op) => (<li key={op} data-blocked={op}>blocked: {op}</li>))}
      </ul>
      <ul className="text-xs" data-testid="bridge-inputs">
        {requiredInputs.map((i) => (<li key={i}>requires: {i}</li>))}
      </ul>
      <ul className="text-xs" data-testid="bridge-outputs">
        {producedOutputs.map((o) => (<li key={o}>produces: {o}</li>))}
      </ul>
      <p className="text-xs" data-testid="bridge-safety">
        {`read-only: ${String(safety.readOnly ?? true)} · write-impossible: ${String(safety.writeImpossible ?? true)} · no-legacy-mutation: ${String(safety.noLegacyMutation ?? true)} · rollback: ${c.rollback?.featureFlagDefault ?? 'off'}`}
      </p>
    </section>
  );
}

export default EmpresasRuntimeBridgeDryRunContract;
