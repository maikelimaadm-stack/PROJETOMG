import { RuntimeV2DevPreviewHub } from '../hub/RuntimeV2DevPreviewHub.jsx';
import { EmpresasGuardedReadUiOverlay } from '../../../migration/empresas-guarded-read-ui/overlay/components/EmpresasGuardedReadUiOverlay.jsx';

/**
 * Dev-only page rendered at the runtime v2 preview route. Presentational: shows
 * the DEV-ONLY banner, flag/production status, the aggregated Hub (Empresas +
 * cadcps, with dataset summary when the dataset flag is on), diagnostics, and
 * limitations. It never fetches, never executes anything, never uses real data.
 *
 * @param {Object} props
 * @param {import('../../../types/dev-preview-route.js').RuntimeV2DevPreviewRouteModel} props.routeModel
 * @param {Record<string, unknown>} [props.env]
 */
export function RuntimeV2DevPreviewRoutePage({ routeModel, env }) {
  const model = routeModel ?? {};

  return (
    <main className="mak-dev-route-page" data-testid="runtime-v2-dev-preview-route-page" data-dev-only="true">
      <header className="mak-dev-route-header">
        <h1 className="text-base font-semibold">Runtime v2 — Dev Preview Route</h1>
        <p className="text-xs" data-testid="dev-route-banner">{model.status?.banner}</p>
      </header>

      <section className="mak-dev-route-status" data-testid="dev-route-status">
        <p className="text-xs">
          {`route: ${model.enabled ? 'enabled' : 'disabled'}`}
          {` · hub: ${model.hubEnabled ? 'on' : 'off'}`}
          {` · dataset: ${model.datasetEnabled ? 'on' : 'off'}`}
          {` · environment: ${model.environment ?? 'unknown'}`}
          {model.productionBlocked ? ' · production-blocked' : ''}
        </p>
        <ul className="text-xs">
          {(model.warnings ?? []).map((w, i) => (
            <li key={`rw-${i}`}>{w}</li>
          ))}
        </ul>
      </section>

      {model.hubModel ? (
        <RuntimeV2DevPreviewHub hubModel={model.hubModel} env={env} />
      ) : (
        <p className="text-xs" data-testid="dev-route-no-hub">Hub not rendered (hub flag off or unavailable).</p>
      )}

      {/* DEV-ONLY, opt-in: Empresas guarded read UI overlay. Renders its own safe fallback when its
          flag is off; never fetches, never writes, never touches the real Empresas screen. */}
      <EmpresasGuardedReadUiOverlay model={model.empresasGuardedReadUiOverlay} env={env} />

      <section className="mak-dev-route-limitations" data-testid="dev-route-limitations">
        <h4 className="text-xs font-semibold">Limitations</h4>
        <ul className="text-xs">
          {(model.limitations ?? []).map((l, i) => (
            <li key={`rl-${i}`}>{l}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default RuntimeV2DevPreviewRoutePage;
