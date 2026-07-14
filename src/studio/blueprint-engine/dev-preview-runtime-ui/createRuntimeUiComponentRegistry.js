import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_COMPONENT_NAMES, FORBIDDEN_PROTOTYPE_IMPORT_PREFIXES, runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * The local, isolated registry of the React components/placeholders this UI runtime may render.
 * It lists ONLY components local to this slice's subtree; it proves no forbidden prototype /
 * pages / components import is registered. Pure and deterministic. It records component NAMES and
 * relative subtree file names only — it does not import the `.jsx` modules.
 *
 * @returns {Object}
 */
export function createRuntimeUiComponentRegistry() {
  const components = RUNTIME_UI_COMPONENT_NAMES.map((name) => ({
    name,
    localToSubtree: true,
    file: `${name}.jsx`,
    fromOldPrototype: false,
    realComponentImportFromForbiddenPath: false,
  }));
  const core = {
    kind: 'runtime-ui-component-registry',
    components,
    componentCount: components.length,
    allLocalToSubtree: components.every((x) => x.localToSubtree === true),
    anyFromOldPrototype: components.some((x) => x.fromOldPrototype === true),
    forbiddenImportPrefixes: [...FORBIDDEN_PROTOTYPE_IMPORT_PREFIXES],
    importsOldPrototype: false,
    importsPages: false,
    importsComponents: false,
  };
  return safeCloneGenericModel({ ...core, componentRegistryDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiComponentRegistry;
