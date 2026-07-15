/**
 * Isolated not-found view for the dev-only route/menu host. Pure, presentational, synthetic-only.
 * No side effects, no window/document, no ReactDOM. Automatic JSX runtime (no react import).
 *
 * @param {{ path?: string, style?: Object }} props
 */
export function StudioDevPreviewNotFound({ path = '', style }) {
  return (
    <div data-studio-dev-preview="not-found" role="status" style={style}>
      <strong>Rota isolada não encontrada</strong>
      <p>{path}</p>
    </div>
  );
}

export default StudioDevPreviewNotFound;
