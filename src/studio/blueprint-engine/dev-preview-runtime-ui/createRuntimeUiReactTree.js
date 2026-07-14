import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_COMPONENT_NAMES, runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * Describes the isolated React/JSX UI tree as deterministic METADATA (component names + node
 * kinds), derived from the runtime UI contract's node contract. This `.js` module does NOT import
 * the `.jsx` components (that would pull JSX into the pure import graph); the real renderable
 * React lives in the sibling `.jsx` files, referenced here by name. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @returns {Object}
 */
export function createRuntimeUiReactTree(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const nc = isGenericModelPlainObject(c.nodeContract) ? c.nodeContract : {};
  const rootKind = isGenericModelPlainObject(nc.root) ? String(nc.root.nodeKind ?? 'uiRoot') : 'uiRoot';

  const tree = {
    component: 'RuntimeUiRoot',
    nodeKind: rootKind,
    children: [
      {
        component: 'RuntimeUiScreen',
        nodeKind: 'uiRegion',
        children: [
          { component: 'RuntimeUiSection', nodeKind: 'uiSection', children: [
            { component: 'RuntimeUiSlot', nodeKind: 'uiTable', children: [] },
            { component: 'RuntimeUiPlaceholder', nodeKind: 'uiEmptyState', children: [] },
          ] },
          { component: 'RuntimeUiBlockedActionBanner', nodeKind: 'uiBlockedState', children: [] },
        ],
      },
    ],
  };

  const core = {
    kind: 'runtime-ui-react-tree',
    tree,
    rootComponent: 'RuntimeUiRoot',
    componentNames: [...RUNTIME_UI_COMPONENT_NAMES],
    reactComponentCreated: true,
    jsxCreated: true,
    tsxCreated: false,
    domNodeCreated: false,
    reactDomUsed: false,
    createRootUsed: false,
    mountedToRealDom: false,
    confinedToAuthorizedSubtree: true,
  };
  return safeCloneGenericModel({ ...core, reactTreeDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiReactTree;
