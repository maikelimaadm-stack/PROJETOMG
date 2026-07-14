# Route & Placement Plan (BLOCKED)

Both the route-runtime plan and the navigation placement-runtime plan are emitted purely as
**blocked** metadata. They describe where an isolated runtime WOULD live
(`/studio/preview/isolated-runtime/<moduleId>`) and where it WOULD appear in navigation, but
`routeCreated`, `routerMounted`, `menuCreated`, `navMounted`, `appTouched`,
`navigationTouched`, `exposedInApp` are all `false` and `blockedNow: true`. Reason:
`requires future approved isolated runtime implementation slice`. Consuming this changes nothing
in the running app.
