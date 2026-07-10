import { EmpresasReadUiParityStatus } from './EmpresasReadUiParityStatus.jsx';
import { EmpresasReadUiParityChecklist } from './EmpresasReadUiParityChecklist.jsx';

/**
 * Dev-only, READ-ONLY panel for the Empresas read UI parity hardening. Given a
 * hardening MODEL (from `createEmpresasReadUiParityHardeningModel`), it renders a
 * safe fallback when off/skipped, and otherwise the status + checklist +
 * blockers/warnings. It has NO functional save/edit/delete, NO onClick/onSubmit/
 * onChange with a side effect, never calls the backend, never touches storage,
 * never mutates data. Pure model → markup.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-read-ui-parity-hardening.js').EmpresasReadUiParityHardeningModel} [props.model]
 */
export function EmpresasReadUiParityHardeningPanel({ model }) {
  if (!model || model.enabled !== true || model.skipped === true) {
    return (
      <section className="mak-parity-fallback" data-testid="empresas-read-ui-parity-fallback" data-dev-only="true">
        <p className="text-xs">Empresas Read UI Parity Hardening desligado (dev-only, opt-in).</p>
      </section>
    );
  }

  const blockers = Array.isArray(model.blockers) ? model.blockers : [];
  const warnings = Array.isArray(model.warnings) ? model.warnings : [];

  return (
    <section className="mak-parity-panel" data-testid="empresas-read-ui-parity-panel" data-dev-only="true" aria-readonly="true">
      <header className="mak-parity-header">
        <h2 className="text-base font-semibold">Empresas — Read UI Parity Hardening (dev-only)</h2>
      </header>
      <EmpresasReadUiParityStatus model={model} />
      {blockers.length > 0 ? (
        <ul className="mak-parity-blockers text-xs" data-testid="empresas-read-ui-parity-blockers">
          {blockers.map((b, i) => (<li key={`b-${i}`}>blocker: {b}</li>))}
        </ul>
      ) : null}
      {warnings.length > 0 ? (
        <ul className="mak-parity-warnings text-xs" data-testid="empresas-read-ui-parity-warnings">
          {warnings.map((w, i) => (<li key={`w-${i}`}>warning: {w}</li>))}
        </ul>
      ) : null}
      <EmpresasReadUiParityChecklist checklist={model.parityChecklist} />
    </section>
  );
}

export default EmpresasReadUiParityHardeningPanel;
