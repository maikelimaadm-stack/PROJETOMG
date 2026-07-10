import { EmpresasGuardedReadUiOverlayStatus } from './EmpresasGuardedReadUiOverlayStatus.jsx';
import { EmpresasGuardedReadUiOverlayPanel } from './EmpresasGuardedReadUiOverlayPanel.jsx';
import { isEmpresasGuardedReadUiOverlayEnabled } from '../empresasGuardedReadUiOverlayConfig.js';

/**
 * Dev-only, READ-ONLY container for the Empresas guarded read UI overlay. It is
 * a preview surface for the runtime v2 dev preview — NEVER the real Empresas
 * screen. Given a pre-built overlay MODEL (from
 * `createEmpresasGuardedReadUiOverlayModel`), it renders a safe fallback when
 * off/skipped, and otherwise the overlay status + the embedded guarded read UI
 * panel.
 *
 * When no model is provided it decides purely from `env` (fail-closed): if the
 * overlay flag is off it renders the disabled fallback; if on, it renders a
 * "model not provided" status notice. It has NO functional save/edit/delete,
 * NO onClick/onSubmit/onChange with a side effect, never calls the backend,
 * never touches storage, never mutates data.
 *
 * @param {Object} props
 * @param {import('../../../../types/empresas-guarded-read-ui-overlay.js').EmpresasGuardedReadUiOverlayModel} [props.model]
 * @param {Record<string, unknown>} [props.env]
 */
export function EmpresasGuardedReadUiOverlay({ model, env }) {
  const flagOn = isEmpresasGuardedReadUiOverlayEnabled(env);

  // No model provided → decide from env (fail-closed).
  if (!model) {
    if (!flagOn) {
      return (
        <section className="mak-guarded-read-overlay-fallback" data-testid="empresas-guarded-read-ui-overlay-fallback" data-dev-only="true">
          <p className="text-xs">Empresas Guarded Read UI Overlay desligado (dev-only, opt-in).</p>
        </section>
      );
    }
    return (
      <section className="mak-guarded-read-overlay-fallback" data-testid="empresas-guarded-read-ui-overlay-fallback" data-dev-only="true">
        <p className="text-xs">Empresas Guarded Read UI Overlay habilitado — forneça um overlay model para visualizar.</p>
      </section>
    );
  }

  if (model.enabled !== true || model.skipped === true) {
    return (
      <section className="mak-guarded-read-overlay-fallback" data-testid="empresas-guarded-read-ui-overlay-fallback" data-dev-only="true">
        <p className="text-xs">Empresas Guarded Read UI Overlay desligado — nada da tela real. (flag off / fail-closed)</p>
      </section>
    );
  }

  return (
    <section className="mak-guarded-read-overlay" data-testid="empresas-guarded-read-ui-overlay" data-dev-only="true" aria-readonly="true">
      <header className="mak-guarded-read-overlay-header">
        <h2 className="text-base font-semibold">Empresas — Guarded Read UI Overlay (dev-only)</h2>
      </header>
      <EmpresasGuardedReadUiOverlayStatus model={model} />
      <EmpresasGuardedReadUiOverlayPanel model={model} />
    </section>
  );
}

export default EmpresasGuardedReadUiOverlay;
