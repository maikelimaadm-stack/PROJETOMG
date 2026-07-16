# Router Exposure Implementation Plan — `createRouterExposureImplementationPlan`

Metadata only; asserts no router is wired and no router primitive/API is used, and no route is
exposed to the product: `routerWiringImplemented: false`, `routeExposedToProduct: false`,
`routeElementCreated: false`, `routesElementCreated: false`, `browserRouterUsed: false`,
`createBrowserRouterUsed: false`, `useNavigateUsed: false`. The verifier flags `unsafe_router_wired`,
`unsafe_router_primitive`, and `unsafe_router_api` on inversions.
