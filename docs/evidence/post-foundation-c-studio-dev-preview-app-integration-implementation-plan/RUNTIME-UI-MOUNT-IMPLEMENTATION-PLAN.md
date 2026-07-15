# Runtime UI Mount Implementation Plan — `createRuntimeUiMountImplementationPlan`

Metadata only; asserts the Runtime UI is not mounted in the App and no browser mount primitive is
used: `runtimeUiMountedInApp: false`, `mountImplemented: false`, `reactDomUsed: false`,
`createRootUsed: false`, `windowApiUsed: false`, `documentApiUsed: false`, `mountNodeCreated: false`,
`rootFactoryInjected: false`. The future mount would be explicit dependency-injected only. The
verifier flags `unsafe_runtime_ui_mounted`, `unsafe_react_dom`, and `unsafe_dom_globals`.
