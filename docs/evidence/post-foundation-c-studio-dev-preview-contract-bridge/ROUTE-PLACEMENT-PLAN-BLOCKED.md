# Route & Placement Plan (BLOCKED)

Both the route plan and the navigation placement plan are emitted purely as **blocked**
metadata. They describe where a module WOULD live (`/studio/preview/<moduleId>`) and where
it WOULD appear in navigation, but `wired`, `routeCreated`, `routerMounted`, `menuCreated`,
`navMounted`, `exposedInApp` are all `false` and `blocked: true`. Consuming this changes
nothing in the running app.
