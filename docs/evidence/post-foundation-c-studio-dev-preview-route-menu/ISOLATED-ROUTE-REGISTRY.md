# Isolated Route Registry — `createIsolatedRouteRegistry`

Holds the two isolated dev-preview routes (`/__dev/studio/preview` and
`/__dev/studio/preview/not-found`) in a private, in-memory registry.

- **Isolated:** entries live only in this registry; it never calls a product router,
  `registerProductRoute`, `registerSidebarItem`, or any App API.
- **`/__dev` namespace only:** registering a path outside `/__dev/studio/preview…`
  is rejected.
- Pure/immutable: registration returns a new frozen snapshot; no shared mutable state
  leaks across instances.

This registry is the source of truth the resolver consults; it is never wired into
browser history or `react-router`.
