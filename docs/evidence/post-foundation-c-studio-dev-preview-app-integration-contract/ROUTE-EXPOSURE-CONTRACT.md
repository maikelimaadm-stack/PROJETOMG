# Route Exposure Contract — `createRouteExposureContract`

Metadata only; asserts no route is exposed to the product:

- `routeExposedToProduct: false`, `publicRouteCreated: false`;
- `deepLinkCreated: false`, `browserNavigationAllowed: false`;
- `futureExposure: dev_only_contract`; `requiresManualGate: true`.

No public route or deep link is created — the isolated `/__dev` routes stay private to the host.
