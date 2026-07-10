import { RuntimeV2DevPreviewHubPanel } from './RuntimeV2DevPreviewHubPanel.jsx';
import { isRuntimeV2DevPreviewHubEnabled } from './devPreviewHubConfig.js';

/**
 * Dev-only, opt-in runtime v2 preview hub. It is an exportable component —
 * NOT mounted automatically, NOT a public production route, NOT in the main
 * menu. When the hub flag is off (or in production without an explicit
 * override) it renders nothing (fails closed). When enabled in a dev
 * environment it renders the aggregated preview hub (Empresas + cadcps) from
 * a pre-built, mocked `hubModel` (built via `createRuntimeV2DevPreviewHubModel`).
 *
 * It never executes an action/workflow/connector, never saves/edits/deletes,
 * never calls the backend, and never touches real data.
 *
 * @param {Object} props
 * @param {import('../../../types/dev-preview-hub.js').RuntimeV2DevPreviewHubModel} [props.hubModel]
 * @param {Record<string, unknown>} [props.env] Explicit env (dev harness); defaults to import.meta.env/process.env.
 */
export function RuntimeV2DevPreviewHub({ hubModel, env }) {
  if (!isRuntimeV2DevPreviewHubEnabled(env)) {
    // Fail closed — no hub outside an explicitly opted-in dev environment.
    return null;
  }

  return (
    <section className="mak-dev-hub" data-testid="runtime-v2-dev-preview-hub" data-dev-only="true">
      <header className="mak-dev-hub-header">
        <h1 className="text-base font-semibold">Runtime v2 — Dev Preview Hub</h1>
        <p className="text-xs">dev-only · mocked data · not a production route · not in menu</p>
      </header>
      <RuntimeV2DevPreviewHubPanel hubModel={hubModel} />
    </section>
  );
}

export default RuntimeV2DevPreviewHub;
