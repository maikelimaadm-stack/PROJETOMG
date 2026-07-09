/**
 * Render Engine types (M12).
 * @see docs/runtime-implementation/03-INTERFACES.md#IRenderEngine
 */

/**
 * @typedef {'table'|'form'|'kanban'|'calendar'|'chart'|'map'|'timeline'|'card'|'widget'} ViewMode
 */

/**
 * @typedef {Object} RenderFieldNode
 * @property {'field'} type
 * @property {string} fieldCode
 * @property {string} component
 * @property {string} [dataType]
 * @property {string} [label]
 * @property {string} [permission] Permission code gating visibility — evaluated via M09, never re-implemented here.
 * @property {string} [actionRef] Action code metadata only — the Render Engine never dispatches it.
 * @property {string} [workflowRef] Workflow code metadata only — the Render Engine never starts it.
 */

/**
 * @typedef {Object} RenderTree
 * @property {string} screenId
 * @property {ViewMode} viewMode
 * @property {string} layoutCode
 * @property {Object} root Adapter-built root node (e.g. `{ type: 'view', component: 'TableView', children: RenderFieldNode[] }`).
 */

/**
 * @typedef {(layoutContext: { layoutCode: string, fields: RenderFieldNode[] }) => { root: Object }} ViewAdapter
 */

/**
 * @typedef {Object} IRenderEngine
 * @property {(screenId: string, ctx: unknown) => Promise<RenderTree>} render
 * @property {(viewMode: ViewMode, adapter: ViewAdapter) => void} registerAdapter
 */

export {};
