/**
 * Isolated fallback UI for an invalid/missing runtime UI contract or a failed preflight. Pure and
 * presentational; announces the blocked/fallback state. No side effects.
 *
 * @param {{ reason?: string, style?: Object }} props
 */
export function RuntimeUiFallback({ reason = 'invalid_or_missing_runtime_ui_contract', style }) {
  return (
    <div data-runtime-ui-node="uiBlockedState" role="alert" data-fallback="true" style={style}>
      <strong>Runtime UI indisponível (dev-only preview)</strong>
      <p>{reason}</p>
    </div>
  );
}

export default RuntimeUiFallback;
