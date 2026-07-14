# Isolation Boundary

`createIsolatedRuntimeBoundaryPlan()` asserts the hard boundaries any future isolated runtime
must respect: `noWindow`, `noDocument`, `noDOM`, `noReact`, `noCSSRuntime`, `noRouteRuntime`,
`noMenuRuntime`, `noModuleRuntime`, `noBackend`, `noPrisma`, `noProduction`, `noStaging` — all
`true`. `allInvariantsHold` proves the complete set.
