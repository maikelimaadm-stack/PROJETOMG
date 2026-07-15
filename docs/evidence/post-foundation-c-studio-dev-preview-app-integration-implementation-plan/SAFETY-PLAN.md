# Safety Plan — `createAppIntegrationSafetyPlan`

Aggregates the forbidden-side-effect flags and asserts none is present: `anyForbiddenSideEffect: false`,
`reversibleByNonConsumption: true`, `planOnly: true`, and a `forbiddenFlags` object where every flag
(`appTouched`, `appWiringImplemented`, `productionUiGuardExtended`, `featureFlagConnectedToApp`,
`runtimeUiMountedInApp`, `reactDomUsed`, `createRootUsed`, `windowUsed`, `documentUsed`,
`backendAccessed`, `prismaAccessed`, `realDataRead`, `realDataWrite`, `oldPrototypeImported`, …) is
`false`. The composer treats `anyForbiddenSideEffect === true` as a blocker.
