import { createEmpresasDevPreviewModel, isEmpresasDevPreviewEnabled } from './devPreviewConfig.js';
import { PreviewTable } from './PreviewTable.jsx';
import { PreviewForm } from './PreviewForm.jsx';
import { PreviewDiagnostics } from './PreviewDiagnostics.jsx';

/**
 * Dev-only, opt-in, isolated visual preview of the Empresas runtime v2 preview
 * model. It is NOT mounted in production navigation, NOT a public route, and
 * does NOT control the real Empresas screen. When the dev flag is off it
 * renders nothing (fails closed). It renders only structural data — table,
 * form, diagnostics, differences, and actions/workflows as text metadata —
 * and never executes an action/workflow/connector, saves data, or calls the
 * backend.
 *
 * @param {Object} props
 * @param {import('../../types/preview.js').PreviewModel} [props.previewModel]
 * @param {Record<string, unknown>} [props.env] Explicit env (dev harness); defaults to import.meta.env/process.env.
 * @param {boolean} [props.skipped]
 */
export function EmpresasDevPreview({ previewModel, env, skipped }) {
  if (!isEmpresasDevPreviewEnabled(env)) {
    // Fail closed — no dev preview outside an explicitly opted-in dev environment.
    return null;
  }

  const view = createEmpresasDevPreviewModel(previewModel, { env, skipped });

  return (
    <section className="mak-dev-preview" data-testid="empresas-dev-preview" data-dev-only="true">
      <header className="mak-dev-preview-header">
        <h2 className="text-base font-semibold">{view.header}</h2>
        <p className="text-xs">
          {`status: dev-only`}
          {view.status.enabled ? ' · enabled' : ' · disabled'}
          {view.status.skipped ? ' · skipped' : ''}
          {view.valid ? ' · valid' : ' · fallback'}
        </p>
      </header>

      <PreviewTable table={view.table} />
      <PreviewForm form={view.form} />
      <PreviewDiagnostics
        diagnostics={view.diagnostics}
        differences={view.differences}
        actions={view.actions}
        workflows={view.workflows}
        metadata={view.metadata}
      />
    </section>
  );
}

export default EmpresasDevPreview;
