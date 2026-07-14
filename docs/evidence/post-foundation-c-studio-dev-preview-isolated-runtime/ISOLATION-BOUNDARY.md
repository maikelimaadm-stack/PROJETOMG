# Isolation Boundary

`createIsolatedRuntimeIsolationBoundary()` asserts the hard isolation invariants the runtime
respects: `noWindow`, `noDocument`, `noDOM`, `noReact`, `noCSSRuntime`, `noRouteRuntime`,
`noMenuRuntime`, `noModuleRuntime`, `noBackend`, `noPrisma`, `noProduction`, `noStaging` — all
`true`. `allInvariantsHold` proves the complete set.
