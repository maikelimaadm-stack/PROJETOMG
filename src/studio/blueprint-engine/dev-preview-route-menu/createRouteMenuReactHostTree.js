import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_COMPONENT_NAMES, routeMenuDigest } from './routeMenuConfig.js';

/**
 * Describes the isolated React/JSX host tree as deterministic METADATA (component names). The
 * renderable React lives in the sibling `.jsx` files; this pure `.js` module does NOT import them
 * (keeping the module graph importable by `node --test`). Pure and deterministic.
 * @returns {Object}
 */
export function createRouteMenuReactHostTree() {
  const tree = {
    component: 'StudioDevPreviewRouteMenuHost',
    children: [
      { component: 'StudioDevPreviewMenu', children: [] },
      { component: 'StudioDevPreviewRouteView', children: [
        { component: 'StudioDevPreviewNotFound', children: [] },
        { component: 'StudioDevPreviewBlocked', children: [] },
      ] },
    ],
  };
  const core = {
    kind: 'route-menu-react-host-tree',
    tree,
    rootComponent: 'StudioDevPreviewRouteMenuHost',
    componentNames: [...ROUTE_MENU_COMPONENT_NAMES],
    reactComponentCreated: true,
    jsxCreated: true,
    tsxCreated: false,
    reactRouterUsed: false,
    reactDomUsed: false,
    internalCreateRootUsed: false,
    mountedByDefault: false,
    confinedToIsolatedHost: true,
  };
  return safeCloneGenericModel({ ...core, reactHostTreeDigest: routeMenuDigest(core) });
}

export default createRouteMenuReactHostTree;
