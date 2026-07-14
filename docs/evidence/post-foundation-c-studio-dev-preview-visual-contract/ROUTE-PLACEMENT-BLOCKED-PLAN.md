# Route & Placement Plan (BLOCKED)

Both the route plan and the navigation placement plan are emitted purely as **blocked**
metadata. They describe where a visual preview WOULD live
(`/studio/preview/visual/<moduleId>`) and where it WOULD appear in navigation, but
`routeCreated`, `routerMounted`, `menuCreated`, `navMounted`, `appTouched`,
`navigationTouched`, `exposedInApp` are all `false` and `blockedNow: true`. Reason:
`requires future approved dev preview runtime slice`. Consuming this changes nothing in the
running app.
