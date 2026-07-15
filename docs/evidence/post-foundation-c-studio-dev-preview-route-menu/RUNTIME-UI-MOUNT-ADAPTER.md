# Runtime UI Mount Adapter — `mountStudioDevPreviewRouteMenu`

The only place a real React root is created — and it is created **only** through
explicit dependency injection.

## Contract

`mountStudioDevPreviewRouteMenu({ ..., rootFactory, mountNode, hostElementFactory })`

- The adapter **never** references `window`, `document`, `ReactDOM`, or `createRoot`.
- It obtains a root exclusively via `root = rootFactory(mountNode)`.
- Rendering goes through `root.render(...)`; disposal through `root.unmount()`.
- Nothing mounts on import; the adapter must be called explicitly.

## Fail-closed ordering

Before touching `rootFactory`, the adapter checks, in order:

1. production/staging → `production_or_staging_denied`
2. disabled/default-off → `default_off_or_disabled`
3. environment ≠ development → `environment_not_development`
4. checkpoint ≠ approved → `checkpoint_not_approved`
5. feature gate closed → `feature_gate_closed`
6. missing `rootFactory` → `root_factory_missing`
7. missing `mountNode` → `mount_node_missing`
8. route guard denied → `route_guard_denied`

Each blocked result returns `{ mounted: false, blocked: true, rootFactoryCalled: false, … }`
with no-op `navigateLocal`/`render`/`dispose`/`getSnapshot`. Only when all pass does
the adapter build the navigation controller, render the initial snapshot, and wire
`onChange → re-render`.
