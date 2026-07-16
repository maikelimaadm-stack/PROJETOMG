import { StudioDevPreviewRouteMenuHost } from '../dev-preview-route-menu/StudioDevPreviewRouteMenuHost.jsx';
import { ISOLATED_ROUTE_PATHS, ROUTE_MENU_COMPONENT_NAMES } from '../dev-preview-route-menu/index.js';
import { STUDIO_DEV_PREVIEW_ROUTE_PATH } from './appIntegrationConfig.js';
import { StudioDevPreviewLazyBoundary } from './StudioDevPreviewLazyBoundary.jsx';

/**
 * The lazy-loaded route element for the dev-only Studio Dev Preview. This module is imported ONLY via
 * a dynamic import gated behind a build-time `import.meta.env.DEV` in `src/App.jsx`, so it is stripped
 * from the production bundle. It renders EXCLUSIVELY the isolated host delivered in
 * `src/studio/blueprint-engine/dev-preview-route-menu/`, with SYNTHETIC data only. It creates no
 * ReactDOM root (React Router renders this element), touches no window/document, reads no real data,
 * registers no menu/sidebar/public route, and never imports the old Studio prototype. Automatic JSX
 * runtime (no React import). Failures are contained locally by the lazy boundary and, at render time,
 * by the App's existing GlobalErrorBoundary.
 *
 * @param {{ style?: Object }} [props]
 */
export function StudioDevPreviewAppBoundary({ style } = {}) {
  // Synthetic, dev-only preview snapshot — never real data.
  const snapshot = {
    screenKind: 'preview',
    path: ISOLATED_ROUTE_PATHS[0] ?? STUDIO_DEV_PREVIEW_ROUTE_PATH,
    synthetic: true,
    components: [...ROUTE_MENU_COMPONENT_NAMES],
  };
  const menuItems = [{ id: 'preview', label: 'Preview', path: snapshot.path }];

  return (
    <StudioDevPreviewLazyBoundary style={style}>
      <div data-studio-dev-preview-app="route" data-path={STUDIO_DEV_PREVIEW_ROUTE_PATH}>
        <StudioDevPreviewRouteMenuHost
          gateOpen
          menuItems={menuItems}
          snapshot={snapshot}
          runtimeUiElement={
            <div data-studio-dev-preview-app="synthetic-runtime-ui">
              Studio Dev Preview (dev-only, synthetic).
            </div>
          }
        />
      </div>
    </StudioDevPreviewLazyBoundary>
  );
}

export default StudioDevPreviewAppBoundary;
