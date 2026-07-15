# Runtime UI Mount Adapter Contract — `createRuntimeUiMountAdapterContract`

Metadata only; asserts the Runtime UI is not mounted in the App and no browser mount primitive is
created here:

- `runtimeUiMountedInApp: false`, `mountAdapterCreated: false`;
- `reactDomUsed: false`, `createRootUsed: false`, `windowUsed: false`, `documentUsed: false`;
- `mountNodeCreated: false`, `rootFactoryInjected: false`;
- `futureMountKind: explicit_dependency_injected_root_factory_and_mount_node`.

The future mount would happen only through explicit dependency injection (`rootFactory` +
`mountNode`), never via `ReactDOM`/`createRoot`/`window`/`document` here.
