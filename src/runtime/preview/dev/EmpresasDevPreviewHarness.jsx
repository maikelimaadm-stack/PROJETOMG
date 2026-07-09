import { EmpresasDevPreview } from './EmpresasDevPreview.jsx';
import { createEmpresasDevPreviewFixture } from './createEmpresasDevPreviewFixture.js';
import { isEmpresasDevPreviewHarnessEnabled } from './devPreviewHarnessConfig.js';
import { EMPRESAS_DEV_PREVIEW_FLAG } from './devPreviewConfig.js';

/**
 * Dev-only, opt-in preview HARNESS for Empresas. It is an exportable wrapper
 * — NOT mounted automatically, NOT a public production route, NOT in the main
 * menu. When the harness flag is off (or in production without an explicit
 * override) it renders nothing (fails closed). When enabled in a dev
 * environment it feeds a SAFE, deterministic, mocked fixture (never real
 * data) into `EmpresasDevPreview` for visual validation.
 *
 * It never executes an action/workflow/connector, never saves/edits/deletes,
 * never calls the backend, and never touches real data.
 *
 * @param {Object} props
 * @param {Record<string, unknown>} [props.env] Explicit env (dev harness); defaults to import.meta.env/process.env.
 */
export function EmpresasDevPreviewHarness({ env }) {
  if (!isEmpresasDevPreviewHarnessEnabled(env)) {
    // Fail closed — no harness outside an explicitly opted-in dev environment.
    return null;
  }

  const fixture = createEmpresasDevPreviewFixture();
  // Enabling the harness flag also switches on the inner dev preview; production
  // fail-closed still applies because the env (incl. PROD) is passed through.
  const effectiveEnv = { ...(env ?? {}), [EMPRESAS_DEV_PREVIEW_FLAG]: 'true' };

  return (
    <section className="mak-dev-preview-harness" data-testid="empresas-dev-preview-harness" data-dev-only="true">
      <header className="mak-dev-preview-harness-header">
        <h1 className="text-base font-semibold">Empresas — Runtime v2 Dev Preview Harness</h1>
        <p className="text-xs">dev-only · mocked data · not a production route · not in menu</p>
      </header>
      <EmpresasDevPreview previewModel={fixture} env={effectiveEnv} />
    </section>
  );
}

export default EmpresasDevPreviewHarness;
