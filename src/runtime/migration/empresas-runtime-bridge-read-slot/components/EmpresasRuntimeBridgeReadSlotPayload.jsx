/**
 * Dev-only, READ-ONLY renderer for the Empresas read slot payload summary.
 * Shows table/form/diagnostics/writeGuard/parity/safety summaries. Pure props →
 * markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotPayload} [props.payload]
 */
export function EmpresasRuntimeBridgeReadSlotPayload({ payload }) {
  const p = payload ?? {};
  const table = p.table ?? {};
  const form = p.form ?? {};
  const wg = p.writeGuard ?? {};
  const parity = p.parity ?? {};
  const safety = p.safety ?? {};
  return (
    <section className="mak-read-slot-payload" data-testid="empresas-read-slot-payload" aria-readonly="true">
      <h3 className="text-sm font-semibold">Read Slot Payload (summary)</h3>
      <ul className="text-xs">
        <li data-testid="payload-id">payloadId: {p.payloadId ?? ''}</li>
        <li data-testid="payload-slot">slotId: {p.slotId ?? ''}</li>
        <li data-testid="payload-table">table: {(Array.isArray(table.columns) ? table.columns.length : 0)} cols · {(typeof table.rowCount === 'number' ? table.rowCount : 0)} rows</li>
        <li data-testid="payload-form">form: {(Array.isArray(form.fields) ? form.fields.length : 0)} fields</li>
        <li data-testid="payload-diagnostics">diagnostics: {p.diagnostics ? 'present' : 'absent'}</li>
        <li data-testid="payload-writeguard">writeGuard: readOnly {String(wg.readOnly ?? true)} · blocked {(Array.isArray(wg.blockedOperations) ? wg.blockedOperations.length : 0)}</li>
        <li data-testid="payload-parity">parity: {parity.parityStatus ?? 'unknown'}</li>
        <li data-testid="payload-safety">safety: noSideEffects {String(safety.noSideEffects ?? true)} · usesRealData {String(safety.usesRealData ?? false)}</li>
      </ul>
    </section>
  );
}

export default EmpresasRuntimeBridgeReadSlotPayload;
