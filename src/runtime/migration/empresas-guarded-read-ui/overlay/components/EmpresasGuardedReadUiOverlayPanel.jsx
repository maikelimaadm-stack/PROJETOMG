import { EmpresasGuardedReadUiSlice } from '../../components/EmpresasGuardedReadUiSlice.jsx';

/**
 * Dev-only, READ-ONLY preview panel for the Empresas guarded read UI overlay.
 * It organizes the visual preview: dev-only/read-only notices, the controlled/
 * mock data notice, and the embedded guarded read UI slice (table + form +
 * diagnostics + write-blocked panel). Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {import('../../../../types/empresas-guarded-read-ui-overlay.js').EmpresasGuardedReadUiOverlayModel} [props.model]
 */
export function EmpresasGuardedReadUiOverlayPanel({ model }) {
  const m = model ?? {};
  return (
    <section className="mak-guarded-read-overlay-panel" data-testid="empresas-guarded-read-ui-overlay-panel" aria-readonly="true">
      <p className="mak-guarded-read-overlay-notice text-xs" data-testid="overlay-dev-only-notice">
        DEV-ONLY · read-only · dados controlados/mock — nunca a tela real de produção.
      </p>
      <EmpresasGuardedReadUiSlice model={m.guardedReadUi} />
    </section>
  );
}

export default EmpresasGuardedReadUiOverlayPanel;
