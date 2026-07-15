# Safety Contract — `createAppIntegrationSafetyContract`

Aggregates the forbidden-side-effect flags and asserts none is present:

- `anyForbiddenSideEffect: false`;
- `reversibleByNonConsumption: true`; `contractOnly: true`;
- `forbiddenFlags` — every flag (`appTouched`, `appWiringCreated`, `runtimeUiMountedInApp`,
  `reactDomUsed`, `createRootUsed`, `windowUsed`, `documentUsed`, `deepLinkCreated`,
  `moduleGenerated`, `backendAccessed`, `prismaAccessed`, `productionAccessed`, `realDataRead`,
  `realDataWrite`, `oldPrototypeImported`, …) is `false`.

The composer treats `anyForbiddenSideEffect === true` as a blocker, so a certified contract can
carry no forbidden side effect.
