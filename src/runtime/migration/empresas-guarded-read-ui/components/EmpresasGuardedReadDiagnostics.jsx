/**
 * Dev-only, READ-ONLY presentational diagnostics panel for the Empresas guarded
 * read UI slice. Shows parity status, difference counts, warnings, limitations,
 * and rollback status. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-guarded-read-ui-slice.js').EmpresasGuardedReadUiDiagnostics} [props.diagnostics]
 * @param {import('../../../types/empresas-dual-read-shadow-compare.js').EmpresasReadDifference[]} [props.differences]
 */
export function EmpresasGuardedReadDiagnostics({ diagnostics, differences }) {
  const d = diagnostics ?? {};
  const diffs = Array.isArray(differences) ? differences : [];
  const warnings = Array.isArray(d.warnings) ? d.warnings : [];
  const limitations = Array.isArray(d.limitations) ? d.limitations : [];
  return (
    <section className="mak-guarded-read-diagnostics" data-testid="empresas-guarded-read-diagnostics">
      <h3 className="text-sm font-semibold">Diagnostics</h3>
      <ul className="text-xs">
        <li data-testid="diag-parity">parityStatus: {d.parityStatus ?? 'skipped'}</li>
        <li data-testid="diag-total">totalDifferences: {d.totalDifferences ?? diffs.length}</li>
        <li data-testid="diag-blocking">blockingCount: {d.blockingCount ?? 0}</li>
        <li data-testid="diag-critical">criticalCount: {d.criticalCount ?? 0}</li>
        <li data-testid="diag-rollback">rollbackStatus: {d.rollbackStatus ?? 'available'}</li>
        <li data-testid="diag-writeguard">writeGuardStatus: {d.writeGuardStatus ?? 'active'}</li>
      </ul>
      {warnings.length > 0 ? (
        <ul className="mak-guarded-read-warnings text-xs" data-testid="diag-warnings">
          {warnings.map((w, i) => (<li key={i}>{w}</li>))}
        </ul>
      ) : null}
      {limitations.length > 0 ? (
        <ul className="mak-guarded-read-limitations text-xs" data-testid="diag-limitations">
          {limitations.map((l, i) => (<li key={i}>{l}</li>))}
        </ul>
      ) : null}
    </section>
  );
}

export default EmpresasGuardedReadDiagnostics;
