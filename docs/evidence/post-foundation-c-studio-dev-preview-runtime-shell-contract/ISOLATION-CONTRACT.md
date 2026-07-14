# Isolation Contract

`createDevPreviewRuntimeShellIsolationContract()` asserts the hard isolation invariants a future
shell must respect: `noWindow`, `noDocument`, `noDOM`, `noReact`, `noCSSRuntime`,
`noRouteRuntime`, `noMenuRuntime`, `noModuleRuntime`, `noProduction`, `noStaging` — all `true`.
`allInvariantsHold` proves the complete set.
