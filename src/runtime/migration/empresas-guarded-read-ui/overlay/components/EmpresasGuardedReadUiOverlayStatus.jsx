/**
 * Dev-only, READ-ONLY status strip for the Empresas guarded read UI overlay.
 * Shows the flag matrix, parity, difference counts, write-blocked state,
 * rollback availability, and the next step. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../../types/empresas-guarded-read-ui-overlay.js').EmpresasGuardedReadUiOverlayModel} [props.model]
 */
export function EmpresasGuardedReadUiOverlayStatus({ model }) {
  const m = model ?? {};
  const flags = m.flags ?? {};
  return (
    <section className="mak-guarded-read-overlay-status" data-testid="empresas-guarded-read-ui-overlay-status">
      <h3 className="text-sm font-semibold">Overlay Status</h3>
      <ul className="text-xs">
        <li data-testid="ovl-flag-overlay">overlay flag: {flags.overlay?.enabled ? 'on' : 'off'}</li>
        <li data-testid="ovl-flag-guarded">guarded read UI flag: {flags.guardedReadUi?.composedWhenOverlayOn ? 'on (composed)' : (flags.guardedReadUi?.requested ? 'on' : 'off')}</li>
        <li data-testid="ovl-parity">parityStatus: {m.parityStatus ?? 'skipped'}</li>
        <li data-testid="ovl-total">totalDifferences: {m.totalDifferences ?? 0}</li>
        <li data-testid="ovl-blocking">blockingCount: {m.blockingCount ?? 0}</li>
        <li data-testid="ovl-critical">criticalCount: {m.criticalCount ?? 0}</li>
        <li data-testid="ovl-write-blocked">writeBlocked: {String(m.writeBlocked ?? true)}</li>
        <li data-testid="ovl-rollback">rollback: {m.diagnostics?.rollbackStatus ?? 'available'}</li>
        <li data-testid="ovl-next">nextAllowedStep: {m.nextAllowedStep ?? ''}</li>
      </ul>
    </section>
  );
}

export default EmpresasGuardedReadUiOverlayStatus;
