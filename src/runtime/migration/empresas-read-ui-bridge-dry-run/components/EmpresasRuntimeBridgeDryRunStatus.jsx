/**
 * Dev-only, READ-ONLY status strip for the Empresas runtime bridge dry run.
 * Shows the flag, readiness, bridgeReady, safeToProceed, blockers/warnings
 * counts, and the next step. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasReadUiRuntimeBridgeDryRunModel} [props.model]
 */
export function EmpresasRuntimeBridgeDryRunStatus({ model }) {
  const m = model ?? {};
  const sim = m.mountSimulation ?? {};
  const flags = m.flags ?? {};
  return (
    <section className="mak-bridge-dry-run-status" data-testid="empresas-bridge-dry-run-status">
      <h3 className="text-sm font-semibold">Bridge Dry Run Status</h3>
      <ul className="text-xs">
        <li data-testid="bridge-flag">dry run flag: {flags.bridgeDryRun?.enabled ? 'on' : 'off'}</li>
        <li data-testid="bridge-mode">bridgeMode: {m.bridgeMode ?? 'dry_run'}</li>
        <li data-testid="bridge-readiness">readinessStatus: {m.readinessStatus ?? 'skipped'}</li>
        <li data-testid="bridge-ready">bridgeReady: {String(m.bridgeReady ?? false)}</li>
        <li data-testid="bridge-safe">safeToProceed: {String(sim.safeToProceed ?? false)}</li>
        <li data-testid="bridge-blockers">blockers: {(m.blockers ?? []).length}</li>
        <li data-testid="bridge-warnings">warnings: {(m.warnings ?? []).length}</li>
        <li data-testid="bridge-next">nextAllowedStep: {m.nextAllowedStep ?? ''}</li>
      </ul>
    </section>
  );
}

export default EmpresasRuntimeBridgeDryRunStatus;
