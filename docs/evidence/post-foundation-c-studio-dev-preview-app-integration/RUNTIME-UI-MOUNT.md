# Runtime UI Mount

The dev route renders the isolated host from `src/studio/blueprint-engine/dev-preview-route-menu/`
(`StudioDevPreviewRouteMenuHost.jsx`) with **synthetic** data. React Router renders the boundary
element — no imperative mount, so no `ReactDOM`/`createRoot`/`window`/`document`. The
`createRuntimeUiMountRequest` model documents the DI contract preserved from the route-menu runtime:
explicit request/mount, isolated host only, dependency-injected (`requiresRootFactory`,
`requiresMountNode`), never a global root/singleton/service-locator, never mounted by default, never
storage/network/real-data. `runtimeUiMountedInApp:true`, `runtimeUiMountedByDefault:false`.
