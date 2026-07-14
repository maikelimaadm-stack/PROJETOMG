/**
 * Isolated placeholder node for the dev-only runtime UI. Pure, presentational, synthetic-only.
 * No side effects, no window/document, no ReactDOM. Style is an inline token object passed as a
 * prop (no CSS runtime, no stylesheet).
 *
 * @param {{ label?: string, nodeKind?: string, style?: Object }} props
 */
export function RuntimeUiPlaceholder({ label = 'placeholder', nodeKind = 'uiPlaceholder', style }) {
  return (
    <div data-runtime-ui-node={nodeKind} style={style} aria-label={label}>
      <span>{label}</span>
    </div>
  );
}

export default RuntimeUiPlaceholder;
