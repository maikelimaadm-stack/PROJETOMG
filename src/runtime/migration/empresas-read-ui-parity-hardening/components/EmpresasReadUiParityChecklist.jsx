/**
 * Dev-only, READ-ONLY checklist renderer for the Empresas read UI parity
 * hardening. Groups items by category and shows status/severity/blocking plus
 * evidence/remediation. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-read-ui-parity-hardening.js').ParityChecklistItem[]} [props.checklist]
 */
export function EmpresasReadUiParityChecklist({ checklist }) {
  const items = Array.isArray(checklist) ? checklist : [];
  const categories = [...new Set(items.map((i) => i.category))];
  return (
    <section className="mak-parity-checklist" data-testid="empresas-read-ui-parity-checklist">
      <h3 className="text-sm font-semibold">Parity Checklist</h3>
      {categories.map((cat) => (
        <div key={cat} className="mak-parity-checklist-group" data-category={cat}>
          <h4 className="text-xs font-semibold">{cat}</h4>
          <ul className="text-xs">
            {items.filter((i) => i.category === cat).map((i) => (
              <li key={i.id} data-item={i.id} data-status={i.status} data-severity={i.severity} data-blocking={String(i.blocking)}>
                [{i.status}] {i.label}
                <span className="mak-parity-item-meta">
                  {` · severity: ${i.severity}`}
                  {i.blocking ? ' · blocking' : ''}
                  {i.evidence ? ` · ${i.evidence}` : ''}
                  {i.status !== 'pass' && i.remediation ? ` · fix: ${i.remediation}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default EmpresasReadUiParityChecklist;
