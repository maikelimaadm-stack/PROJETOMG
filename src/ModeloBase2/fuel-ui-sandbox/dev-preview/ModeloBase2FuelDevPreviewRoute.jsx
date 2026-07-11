import { useMemo } from 'react';
import { ModeloBase2FuelSandboxShell } from '../components/ModeloBase2FuelSandboxShell.jsx';
import { ModeloBase2FuelStatusBadges } from '../components/ModeloBase2FuelStatusBadges.jsx';
import { ModeloBase2FuelDiagnosticsPanel } from '../components/ModeloBase2FuelDiagnosticsPanel.jsx';
import { createModeloBase2FuelSandboxSession } from '../createModeloBase2FuelSandboxSession.js';
import { resolveModeloBase2FuelDevPreviewAccess } from './resolveModeloBase2FuelDevPreviewAccess.js';
import { createModeloBase2FuelDevPreviewFixtures } from './createModeloBase2FuelDevPreviewFixtures.js';
import { createModeloBase2FuelDevPreviewDiagnostics } from './createModeloBase2FuelDevPreviewDiagnostics.js';
import { MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH } from './modeloBase2FuelDevPreviewConfig.js';

const DEV_BADGES = [
  { id: 'devPreview', label: 'Dev preview', tone: 'warn' },
  { id: 'localBeta', label: 'Local beta', tone: 'info' },
  { id: 'offlineFirst', label: 'Offline-first', tone: 'info' },
  { id: 'notSynced', label: 'Não sincronizado', tone: 'warn' },
  { id: 'sentFalse', label: 'sent:false', tone: 'muted' },
  { id: 'persistenceRealFalse', label: 'persistenceReal:false', tone: 'muted' },
];

/**
 * DEV-ONLY, guarded route component for the ModeloBase2 fuel UI sandbox. It is a
 * self-guarding route unit: mounted at MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH
 * ("/__dev/modelobase2/fuel") only behind the dev guard in `src/App.jsx`, NOT in
 * the main menu, NOT a production route. When access is denied it renders a SAFE
 * FALLBACK (never the sandbox, never real data). It never fetches, never persists,
 * never touches a backend/Prisma/runtimeBridge. Fixtures are deterministic/fictional.
 *
 * @param {Object} props
 * @param {Record<string, unknown>} [props.env]
 * @param {'empty'|'basic'|'withDraft'|'withEvents'} [props.mode]
 */
export function ModeloBase2FuelDevPreviewRoute({ env, mode = 'basic' }) {
  const access = useMemo(() => resolveModeloBase2FuelDevPreviewAccess({ env: env || {} }), [env]);

  const session = useMemo(() => {
    const s = createModeloBase2FuelSandboxSession({ moduleId: 'combustivel', enabled: access.allowed });
    if (access.allowed) {
      const fixtures = createModeloBase2FuelDevPreviewFixtures({ mode });
      for (const step of fixtures.seedActions) s.dispatchAction(step.action, step.payload);
    }
    return s;
  }, [access.allowed, mode]);

  const diagnostics = useMemo(
    () => createModeloBase2FuelDevPreviewDiagnostics({ previewId: 'fuel-dev-preview-combustivel', access, fixtureMode: mode, warnings: access.warnings }),
    [access, mode],
  );

  if (!access.allowed) {
    return (
      <div className="mak-dev-route-fallback" data-testid="modelobase2-fuel-dev-preview-fallback" data-dev-only="true">
        <p className="text-xs">
          ModeloBase2 fuel dev preview route is disabled (dev-only, opt-in). Route: {MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH}
        </p>
        <ModeloBase2FuelDiagnosticsPanel diagnostics={diagnostics} />
      </div>
    );
  }

  return (
    <div className="mb2-fuel-dev-preview" data-dev-only="true" data-route={MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH}>
      <header className="mb2-fuel-dev-preview__header">
        <h1 className="mb2-fuel-dev-preview__title">Fuel Dev Preview (dev-only)</h1>
        <ModeloBase2FuelStatusBadges badges={DEV_BADGES} />
      </header>
      <ModeloBase2FuelSandboxShell moduleId="combustivel" session={session} />
      <ModeloBase2FuelDiagnosticsPanel diagnostics={diagnostics} />
    </div>
  );
}

/**
 * Plain, framework-free route descriptor a dev-only router could spread. Does NOT
 * mount anything by itself.
 * @returns {{ path: string, Component: typeof ModeloBase2FuelDevPreviewRoute, devOnly: true }}
 */
export function getModeloBase2FuelDevPreviewRouteDescriptor() {
  return { path: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH, Component: ModeloBase2FuelDevPreviewRoute, devOnly: true };
}

export default ModeloBase2FuelDevPreviewRoute;
