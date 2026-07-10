/**
 * Dev-only, READ-ONLY status strip for the Empresas read UI parity hardening.
 * Shows the flag, readiness, score, and pass/warn/fail/blocking/critical counts.
 * Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-read-ui-parity-hardening.js').EmpresasReadUiParityHardeningModel} [props.model]
 */
export function EmpresasReadUiParityStatus({ model }) {
  const m = model ?? {};
  const s = m.parityScore ?? {};
  const flags = m.flags ?? {};
  return (
    <section className="mak-parity-status" data-testid="empresas-read-ui-parity-status">
      <h3 className="text-sm font-semibold">Parity Hardening Status</h3>
      <ul className="text-xs">
        <li data-testid="parity-flag">hardening flag: {flags.hardening?.enabled ? 'on' : 'off'}</li>
        <li data-testid="parity-readiness">readinessStatus: {m.readinessStatus ?? 'skipped'}</li>
        <li data-testid="parity-score">scorePercent: {s.scorePercent ?? 0}%</li>
        <li data-testid="parity-pass">passCount: {s.passCount ?? 0}</li>
        <li data-testid="parity-warn">warnCount: {s.warnCount ?? 0}</li>
        <li data-testid="parity-fail">failCount: {s.failCount ?? 0}</li>
        <li data-testid="parity-blocking">blockingCount: {s.blockingCount ?? 0}</li>
        <li data-testid="parity-critical">criticalCount: {s.criticalCount ?? 0}</li>
        <li data-testid="parity-next">nextAllowedStep: {m.nextAllowedStep ?? ''}</li>
      </ul>
    </section>
  );
}

export default EmpresasReadUiParityStatus;
