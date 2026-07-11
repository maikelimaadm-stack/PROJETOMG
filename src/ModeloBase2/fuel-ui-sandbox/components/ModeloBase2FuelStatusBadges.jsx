/**
 * ModeloBase2FuelStatusBadges — dev-only sandbox badges. Presentational; props-driven.
 * NO backend/fetch/Prisma/runtimeBridge/storage; no side effects. Never mounted in
 * the app by this slice.
 *
 * @param {Object} props
 * @param {Array<{ id: string, label: string, tone?: string }>} [props.badges]
 */
export function ModeloBase2FuelStatusBadges({ badges = [] }) {
  const list = Array.isArray(badges) ? badges : [];
  return (
    <div className="mb2-fuel-badges" role="status" aria-label="Fuel sandbox status">
      {list.map((b) => (
        <span key={b.id} className={`mb2-fuel-badge mb2-fuel-badge--${b.tone || 'info'}`} data-badge={b.id}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export default ModeloBase2FuelStatusBadges;
