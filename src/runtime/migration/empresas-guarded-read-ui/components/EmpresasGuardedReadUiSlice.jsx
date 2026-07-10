import { EmpresasGuardedReadTable } from './EmpresasGuardedReadTable.jsx';
import { EmpresasGuardedReadForm } from './EmpresasGuardedReadForm.jsx';
import { EmpresasGuardedReadDiagnostics } from './EmpresasGuardedReadDiagnostics.jsx';
import { EmpresasGuardedReadWriteBlockedPanel } from './EmpresasGuardedReadWriteBlockedPanel.jsx';

/**
 * Dev-only, READ-ONLY container for the Empresas guarded read UI slice. Given a
 * guarded read UI MODEL (built by `createEmpresasGuardedReadUiModel`), it renders
 * a safe fallback when the model is off/skipped, and otherwise a read-only
 * table + form + diagnostics + write-blocked panel.
 *
 * It has NO functional save/edit/delete button, NO onClick/onSubmit/onChange
 * with a side effect, never calls the backend, never touches storage, never
 * mutates data. Pure model → markup.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-guarded-read-ui-slice.js').EmpresasGuardedReadUiModel} [props.model]
 */
export function EmpresasGuardedReadUiSlice({ model }) {
  if (!model || model.enabled !== true || model.skipped === true) {
    return (
      <section className="mak-guarded-read-fallback" data-testid="empresas-guarded-read-fallback">
        <p className="text-xs">
          Empresas Guarded Read UI desligado — nada é renderizado da tela real. (flag off / fail-closed)
        </p>
      </section>
    );
  }

  return (
    <section className="mak-guarded-read-slice" data-testid="empresas-guarded-read-slice" aria-readonly="true">
      <header className="mak-guarded-read-header">
        <h2 className="text-base font-semibold">Empresas — Guarded Read UI (dev-only, read-only)</h2>
        <p className="text-xs">
          mode: {model.mode} · parity: {model.parityStatus} · próximo passo: {model.nextAllowedStep}
        </p>
      </header>
      <EmpresasGuardedReadTable table={model.table} />
      <EmpresasGuardedReadForm form={model.form} />
      <EmpresasGuardedReadDiagnostics diagnostics={model.diagnostics} differences={model.differences} />
      <EmpresasGuardedReadWriteBlockedPanel blockedOperations={model.blockedOperations} writeGuard={model.writeGuard} />
    </section>
  );
}

export default EmpresasGuardedReadUiSlice;
