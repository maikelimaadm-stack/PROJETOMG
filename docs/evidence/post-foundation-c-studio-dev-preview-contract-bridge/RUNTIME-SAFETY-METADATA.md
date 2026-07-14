# Runtime Safety Metadata

Asserts the headless invariant: `anySideEffect: false`, mirroring the frozen capability
flags. `usesStorage`, `usesFetch`, `usesNetwork`, `usesPersistence`, `touchesBackend`,
`touchesPrisma`, `touchesProduction`, `touchesStaging`, `mutates` are all `false`;
`reversibleByNonConsumption: true`. `sideEffectFlags` enumerates every capability and every
value is `false`.
