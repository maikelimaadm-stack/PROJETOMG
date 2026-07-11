/**
 * ModeloBase2FuelDiagnosticsPanel — dev-only diagnostics panel rendered from the
 * sandbox diagnostics. Presentational; props-driven. NO backend/fetch/Prisma/
 * runtimeBridge/storage; no side effects. Never mounted in the app by this slice.
 *
 * @param {Object} props
 * @param {Object} props.diagnostics
 */
export function ModeloBase2FuelDiagnosticsPanel({ diagnostics }) {
  const d = diagnostics && typeof diagnostics === 'object' ? diagnostics : {};
  const flag = (v) => (v === false ? 'false' : (v === true ? 'true' : String(v ?? '—')));

  const rows = [
    ['readiness', d.readiness],
    ['entriesCount', d.entriesCount],
    ['eventsCount', d.eventsCount],
    ['totalLiters', d.totalLiters],
    ['localOnly', d.localOnly],
    ['sent', d.sent],
    ['persistenceReal', d.persistenceReal],
    ['backendTouched', d.backendTouched],
    ['prismaTouched', d.prismaTouched],
    ['runtimeBridgeTouched', d.runtimeBridgeTouched],
    ['uiMountedInApp', d.uiMountedInApp],
    ['routeRegistered', d.routeRegistered],
    ['menuRegistered', d.menuRegistered],
  ];

  return (
    <div className="mb2-fuel-diagnostics" role="region" aria-label="Fuel sandbox diagnostics">
      <h4 className="mb2-fuel-diagnostics__title">Diagnostics (dev-only)</h4>
      <dl className="mb2-fuel-diagnostics__grid">
        {rows.map(([label, value]) => (
          <div key={label} className="mb2-fuel-diagnostics__row" data-diag={label}>
            <dt>{label}</dt>
            <dd>{flag(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default ModeloBase2FuelDiagnosticsPanel;
