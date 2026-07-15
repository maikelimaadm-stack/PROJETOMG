# Isolated Route Resolver — `createIsolatedRouteResolver`

Resolves a requested path against the isolated route registry and returns the screen
descriptor to render.

- `/__dev/studio/preview` → `matched: true`, preview screen.
- Any unknown `/__dev/studio/preview/*` path → `matched: false`, not-found screen.
- Paths outside the `/__dev` namespace never resolve to a real screen.

Resolution is a pure function of `(path, registry)`; it uses no browser location, no
`window`, and no `react-router` matching. The resolver drives the local navigation
controller, not the product router.
