import { RenderError } from './errors.js';

/** Hard cap on declared fields per layout — guards against pathological/oversized definitions. */
const MAX_FIELDS_PER_LAYOUT = 256;

const KNOWN_COMPONENTS = new Set(['TextCell', 'NumberCell', 'BooleanCell', 'DateCell']);

/** @type {Record<string, string>} */
const DATATYPE_COMPONENT_MAP = {
  string: 'TextCell',
  number: 'NumberCell',
  boolean: 'BooleanCell',
  date: 'DateCell',
};

/**
 * Render Engine (M12) — builds an intermediate RenderTree from CRB `layout`
 * + `field` registry entries. Produces plain data, never React/DOM. Action
 * and workflow references are carried as metadata only — never dispatched
 * or started. Permission filtering is delegated to M09, never duplicated.
 * @implements {import('../../types/render.js').IRenderEngine}
 */
export class RenderEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
   */
  constructor(options = {}) {
    const { registry, permissionEngine } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new RenderError('MAK-L3-RENDER-001', 'RenderEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._permissionEngine = permissionEngine ?? null;
    /** @type {Map<string, import('../../types/render.js').ViewAdapter>} */
    this._adapters = new Map();
    this.registerAdapter('table', defaultTableAdapter);
  }

  /**
   * @param {import('../../types/render.js').ViewMode} viewMode
   * @param {import('../../types/render.js').ViewAdapter} adapter
   */
  registerAdapter(viewMode, adapter) {
    if (!isNonEmptyString(viewMode)) {
      throw new RenderError('MAK-L3-RENDER-002', 'registerAdapter() requires a non-empty viewMode');
    }
    if (typeof adapter !== 'function') {
      throw new RenderError('MAK-L3-RENDER-002', `Adapter for viewMode "${viewMode}" must be a function`);
    }
    this._adapters.set(viewMode, adapter);
  }

  /**
   * @param {string} screenId
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} ctx
   * @returns {Promise<import('../../types/render.js').RenderTree>}
   */
  async render(screenId, ctx) {
    if (!isNonEmptyString(screenId)) {
      throw new RenderError('MAK-L3-RENDER-002', 'render() requires a non-empty screenId');
    }

    if (!this._registry.has('layout', screenId)) {
      throw new RenderError('MAK-L3-RENDER-003', `Unknown screen/layout: ${screenId}`);
    }

    const layoutRecord = this._registry.resolve('layout', screenId);
    const viewMode = isNonEmptyString(layoutRecord?.payload?.viewMode) ? layoutRecord.payload.viewMode : 'table';
    const layoutCode = layoutRecord?.code ?? screenId;

    const resolvedFields = this._resolveFields(screenId, layoutRecord?.payload?.fields);
    const visibleFields = await this._filterVisible(resolvedFields, ctx);

    const adapter = this._adapters.get(viewMode);
    if (!adapter) {
      throw new RenderError('MAK-L3-RENDER-006', `No adapter registered for viewMode: ${viewMode}`);
    }

    const { root } = adapter({ layoutCode, fields: visibleFields });
    return Object.freeze({ screenId, viewMode, layoutCode, root });
  }

  /**
   * Structurally validates and resolves field references from a layout
   * definition. Reads only the hydrated CRB `field` registry — no query.
   * @param {string} screenId
   * @param {unknown} rawFields
   * @returns {import('../../types/render.js').RenderFieldNode[]}
   */
  _resolveFields(screenId, rawFields) {
    if (rawFields === undefined) return [];
    if (!Array.isArray(rawFields)) {
      throw new RenderError(
        'MAK-L3-RENDER-004',
        `Layout "${screenId}" has an invalid "fields" declaration (must be an array)`,
      );
    }
    if (rawFields.length > MAX_FIELDS_PER_LAYOUT) {
      throw new RenderError(
        'MAK-L3-RENDER-004',
        `Layout "${screenId}" declares too many fields (${rawFields.length} > ${MAX_FIELDS_PER_LAYOUT})`,
      );
    }

    return rawFields.map((ref) => {
      if (!ref || !isNonEmptyString(ref.field)) {
        throw new RenderError('MAK-L3-RENDER-004', `Layout "${screenId}" has an invalid field reference: ${JSON.stringify(ref)}`);
      }
      if (!this._registry.has('field', ref.field)) {
        throw new RenderError('MAK-L3-RENDER-004', `Layout "${screenId}" references unknown field: ${ref.field}`);
      }

      const fieldRecord = this._registry.resolve('field', ref.field);
      const dataType = fieldRecord?.payload?.dataType;

      return {
        type: 'field',
        fieldCode: ref.field,
        component: resolveComponent(ref, dataType),
        dataType,
        label: isNonEmptyString(ref.label) ? ref.label : undefined,
        permission: isNonEmptyString(ref.permission) ? ref.permission : undefined,
        actionRef: isNonEmptyString(ref.actionRef) ? ref.actionRef : undefined,
        workflowRef: isNonEmptyString(ref.workflowRef) ? ref.workflowRef : undefined,
      };
    });
  }

  /**
   * Delegates visibility decisions to M09 — never re-implements deny/allow.
   * @param {import('../../types/render.js').RenderFieldNode[]} fields
   * @param {unknown} ctx
   */
  async _filterVisible(fields, ctx) {
    if (!this._permissionEngine) {
      // No engine wired — fail-closed only for fields that declare a permission; public fields still render.
      return fields.filter((field) => !field.permission);
    }

    const decisions = await Promise.all(
      fields.map(async (field) => {
        if (!field.permission) return { field, visible: true };

        const idx = field.permission.lastIndexOf('.');
        const resource = idx === -1 ? field.permission : field.permission.slice(0, idx);
        const action = idx === -1 ? 'view' : field.permission.slice(idx + 1);

        let visible = false;
        try {
          visible = await this._permissionEngine.can(action, resource, ctx);
        } catch {
          visible = false;
        }
        return { field, visible };
      }),
    );

    return decisions.filter((decision) => decision.visible).map((decision) => decision.field);
  }
}

/**
 * @param {{component?: string}} ref
 * @param {string} [dataType]
 */
function resolveComponent(ref, dataType) {
  if (isNonEmptyString(ref.component)) {
    if (!KNOWN_COMPONENTS.has(ref.component)) {
      throw new RenderError('MAK-L3-RENDER-005', `Unknown component: ${ref.component}`);
    }
    return ref.component;
  }
  return DATATYPE_COMPONENT_MAP[dataType] ?? 'TextCell';
}

/**
 * Built-in table adapter — flat list of field cells under a TableView root.
 * @type {import('../../types/render.js').ViewAdapter}
 */
function defaultTableAdapter({ layoutCode, fields }) {
  return {
    root: {
      type: 'view',
      component: 'TableView',
      layoutCode,
      children: fields,
    },
  };
}

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
 * @returns {RenderEngine}
 */
export function createRenderEngine(options) {
  return new RenderEngine(options);
}

export { RenderError };
