# Product Isolation Contract — `createProductIsolationContract`

Asserts every product surface stays isolated from the dev-preview host:

- `productAppIsolated`, `productRouterIsolated`, `productMenuIsolated`, `productSidebarIsolated`,
  `productNavigationIsolated`, `productModulesIsolated`, `productDataIsolated` — all `true`;
- `isolationBreached: false`.

The contract describes the isolation invariant the future integration must preserve; it performs no
integration itself.
