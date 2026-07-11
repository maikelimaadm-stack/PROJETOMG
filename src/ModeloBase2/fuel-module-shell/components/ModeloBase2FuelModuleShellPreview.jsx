import { useMemo } from 'react';
import { ModeloBase2FuelSandboxShell } from '../../fuel-ui-sandbox/components/ModeloBase2FuelSandboxShell.jsx';
import { ModeloBase2FuelStatusBadges } from '../../fuel-ui-sandbox/components/ModeloBase2FuelStatusBadges.jsx';
import { createModeloBase2FuelModuleShellReadiness } from '../createModeloBase2FuelModuleShellReadiness.js';

const SHELL_BADGES = [
  { id: 'shellReadiness', label: 'Module shell readiness', tone: 'warn' },
  { id: 'notRegistered', label: 'Não registrado', tone: 'warn' },
  { id: 'noMenu', label: 'Sem menu', tone: 'muted' },
  { id: 'localBeta', label: 'Local beta', tone: 'info' },
  { id: 'sentFalse', label: 'sent:false', tone: 'muted' },
  { id: 'persistenceRealFalse', label: 'persistenceReal:false', tone: 'muted' },
];

/**
 * OPTIONAL, NEVER-MOUNTED preview of the fuel module shell readiness. It is NOT a
 * route and is NOT registered in `src/App.jsx` or the menu — it exists only so the
 * planned module composition can be eyeballed inside the existing dev-only fuel
 * surface. Reuses the fuel-ui-sandbox shell; never fetches/persists; touches no
 * backend/Prisma/runtimeBridge.
 *
 * @param {Object} props
 * @param {Record<string, unknown>} [props.env]
 */
export function ModeloBase2FuelModuleShellPreview({ env }) {
  const readiness = useMemo(() => createModeloBase2FuelModuleShellReadiness({ env: env || {} }), [env]);

  return (
    <div className="mb2-fuel-module-shell-preview" data-not-registered="true" data-module-id={readiness.moduleId}>
      <header className="mb2-fuel-module-shell-preview__header">
        <h1 className="mb2-fuel-module-shell-preview__title">
          {readiness.metadata.displayName} — {readiness.metadata.status}
        </h1>
        <p className="mb2-fuel-module-shell-preview__subtitle text-xs">
          {readiness.metadata.description} · rota planejada: {readiness.routePlan.plannedRoutePath} (não registrada)
        </p>
        <ModeloBase2FuelStatusBadges badges={SHELL_BADGES} />
      </header>
      <ModeloBase2FuelSandboxShell moduleId="combustivel" />
    </div>
  );
}

export default ModeloBase2FuelModuleShellPreview;
