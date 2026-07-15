/**
 * Isolated blocked view for the dev-only route/menu host. Shown when the dev feature gate is closed
 * or access is denied. Pure and presentational; no side effects.
 *
 * @param {{ reason?: string, style?: Object }} props
 */
export function StudioDevPreviewBlocked({ reason = 'feature_gate_closed', style }) {
  return (
    <div data-studio-dev-preview="blocked" role="alert" style={style}>
      <strong>Preview isolado bloqueado (dev-only)</strong>
      <p>{reason}</p>
    </div>
  );
}

export default StudioDevPreviewBlocked;
