import { EmpresasRuntimeBridgeDryRunStatus } from './EmpresasRuntimeBridgeDryRunStatus.jsx';
import { EmpresasRuntimeBridgeDryRunContract } from './EmpresasRuntimeBridgeDryRunContract.jsx';

/**
 * Dev-only, READ-ONLY panel for the Empresas runtime bridge dry run. Given a dry
 * run MODEL (from `createEmpresasReadUiRuntimeBridgeDryRunModel`), it renders a
 * safe fallback when off/skipped, and otherwise the status + contract + mount
 * simulation summary + blockers/warnings. It has NO functional save/edit/delete,
 * NO onClick/onSubmit/onChange with a side effect, never calls the backend,
 * never touches storage, never mounts anything. Pure model → markup.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasReadUiRuntimeBridgeDryRunModel} [props.model]
 */
export function EmpresasRuntimeBridgeDryRunPanel({ model }) {
  if (!model || model.enabled !== true || model.skipped === true) {
    return (
      <section className="mak-bridge-dry-run-fallback" data-testid="empresas-bridge-dry-run-fallback" data-dev-only="true">
        <p className="text-xs">Empresas Runtime Bridge Dry Run desligado (dev-only, opt-in).</p>
      </section>
    );
  }

  const sim = model.mountSimulation ?? {};
  const blockers = Array.isArray(model.blockers) ? model.blockers : [];
  const warnings = Array.isArray(model.warnings) ? model.warnings : [];

  return (
    <section className="mak-bridge-dry-run-panel" data-testid="empresas-bridge-dry-run-panel" data-dev-only="true" aria-readonly="true">
      <header className="mak-bridge-dry-run-header">
        <h2 className="text-base font-semibold">Empresas — Runtime Bridge Dry Run (dev-only)</h2>
      </header>
      <EmpresasRuntimeBridgeDryRunStatus model={model} />
      <section className="mak-bridge-dry-run-mount" data-testid="empresas-bridge-dry-run-mount">
        <p className="text-xs">
          {`wouldMount: ${String(sim.wouldMount ?? false)} · mountTarget: ${sim.mountTarget ?? 'dev_preview_only'} · mountedAnythingReal: ${String(sim.mountedAnythingReal ?? false)}`}
        </p>
      </section>
      {blockers.length > 0 ? (
        <ul className="mak-bridge-dry-run-blockers text-xs" data-testid="empresas-bridge-dry-run-blockers">
          {blockers.map((b, i) => (<li key={`b-${i}`}>blocker: {b}</li>))}
        </ul>
      ) : null}
      {warnings.length > 0 ? (
        <ul className="mak-bridge-dry-run-warnings text-xs" data-testid="empresas-bridge-dry-run-warnings">
          {warnings.map((w, i) => (<li key={`w-${i}`}>warning: {w}</li>))}
        </ul>
      ) : null}
      <EmpresasRuntimeBridgeDryRunContract contract={model.bridgeContract} />
    </section>
  );
}

export default EmpresasRuntimeBridgeDryRunPanel;
