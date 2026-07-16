# No Menu · No Sidebar · No Product Route

The dev route is invisible to the product: it is never registered in any menu or sidebar, is not a
public/product route, and creates no new router. App.jsx adds no `addMenuItem`/`navItems`/
`menu.push`; the only added `<Route>` is the flag+checkpoint-guarded dev-only path under
`/__dev/`. Capability flags `routeExposedToProduct`, `menuExposedToProduct`,
`sidebarExposedToProduct`, `deepLinkPublic`, `routerWiringImplemented` are all `false`; the
verifier flags any inversion.
