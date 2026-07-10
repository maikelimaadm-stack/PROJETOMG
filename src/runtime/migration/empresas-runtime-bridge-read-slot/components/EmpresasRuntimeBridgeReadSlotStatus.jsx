/**
 * Dev-only, READ-ONLY status strip for the Empresas runtime bridge read slot
 * candidate. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotCandidateModel} [props.model]
 */
export function EmpresasRuntimeBridgeReadSlotStatus({ model }) {
  const m = model ?? {};
  const v = m.payloadValidation ?? {};
  const flags = m.flags ?? {};
  return (
    <section className="mak-read-slot-status" data-testid="empresas-read-slot-status">
      <h3 className="text-sm font-semibold">Read Slot Candidate Status</h3>
      <ul className="text-xs">
        <li data-testid="slot-flag">read slot flag: {flags.readSlot?.enabled ? 'on' : 'off'}</li>
        <li data-testid="slot-mode">slotMode: {m.slotMode ?? 'read_only_candidate'}</li>
        <li data-testid="slot-readiness">readinessStatus: {m.readinessStatus ?? 'skipped'}</li>
        <li data-testid="slot-ready">slotReady: {String(m.slotReady ?? false)}</li>
        <li data-testid="slot-safe">safeToProceed: {String(m.safeToProceed ?? false)}</li>
        <li data-testid="slot-payload-valid">payload valid: {String(v.valid ?? false)}</li>
        <li data-testid="slot-blockers">blockers: {(m.blockers ?? []).length}</li>
        <li data-testid="slot-warnings">warnings: {(m.warnings ?? []).length}</li>
        <li data-testid="slot-next">nextAllowedStep: {m.nextAllowedStep ?? ''}</li>
      </ul>
    </section>
  );
}

export default EmpresasRuntimeBridgeReadSlotStatus;
