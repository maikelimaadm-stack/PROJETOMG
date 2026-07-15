import { StudioDevPreviewNotFound } from './StudioDevPreviewNotFound.jsx';

/**
 * Isolated route view for the dev-only route/menu host. It renders the mounted Runtime UI element
 * (built by an injected factory) when the resolved screen is the preview route; otherwise it renders
 * the local not-found view. Pure and presentational. Automatic JSX runtime.
 *
 * @param {{ snapshot?: Object, runtimeUiElement?: unknown, style?: Object }} props
 */
export function StudioDevPreviewRouteView({ snapshot = {}, runtimeUiElement = null, style }) {
  const screenKind = snapshot && snapshot.screenKind;
  if (screenKind === 'preview') {
    return (
      <section data-studio-dev-preview="route-view" data-screen="preview" style={style}>
        {runtimeUiElement}
      </section>
    );
  }
  return (
    <section data-studio-dev-preview="route-view" data-screen="not-found" style={style}>
      <StudioDevPreviewNotFound path={snapshot && snapshot.path} />
    </section>
  );
}

export default StudioDevPreviewRouteView;
