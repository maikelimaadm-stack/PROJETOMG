/**
 * Isolated banner announcing that all actions are blocked in the dev-only runtime UI. Pure and
 * presentational; renders synthetic metadata only. No handlers wired to real effects.
 *
 * @param {{ actions?: Array<{ action: string, blocked: boolean }>, style?: Object }} props
 */
export function RuntimeUiBlockedActionBanner({ actions = [], style }) {
  return (
    <div data-runtime-ui-node="uiBlockedState" role="status" style={style}>
      <strong>Ações bloqueadas (dev-only preview)</strong>
      <ul>
        {actions.map((a) => (
          <li key={a.action} data-blocked={a.blocked ? 'true' : 'false'}>{a.action}</li>
        ))}
      </ul>
    </div>
  );
}

export default RuntimeUiBlockedActionBanner;
