import { StudioDevPreviewMenu } from './StudioDevPreviewMenu.jsx';
import { StudioDevPreviewRouteView } from './StudioDevPreviewRouteView.jsx';
import { StudioDevPreviewBlocked } from './StudioDevPreviewBlocked.jsx';

/**
 * Root of the isolated dev-only route/menu host. It renders a local menu and a local route view for
 * a synthetic snapshot. When the dev feature gate is closed / access is denied it renders the local
 * blocked view. It never mounts itself (no ReactDOM / createRoot), never touches window/document,
 * never wires the main App/router/menu/sidebar, never registers a browser route / public URL, and
 * never imports the old Studio prototype. It is only a React element factory local to this subtree;
 * mounting happens exclusively through the injected mount adapter. Automatic JSX runtime.
 *
 * @param {{ gateOpen?: boolean, menuItems?: Array<Object>, snapshot?: Object, runtimeUiElement?: unknown, onNavigateLocal?: (path:string)=>void, blockedReason?: string, style?: Object }} props
 */
export function StudioDevPreviewRouteMenuHost({
  gateOpen = false,
  menuItems = [],
  snapshot = {},
  runtimeUiElement = null,
  onNavigateLocal,
  blockedReason = 'feature_gate_closed',
  style,
}) {
  if (gateOpen !== true) {
    return (
      <div data-studio-dev-preview="host" data-gate="closed" style={style}>
        <StudioDevPreviewBlocked reason={blockedReason} />
      </div>
    );
  }
  return (
    <div data-studio-dev-preview="host" data-gate="open" style={style}>
      <StudioDevPreviewMenu items={menuItems} onNavigateLocal={onNavigateLocal} />
      <StudioDevPreviewRouteView snapshot={snapshot} runtimeUiElement={runtimeUiElement} />
    </div>
  );
}

export default StudioDevPreviewRouteMenuHost;
