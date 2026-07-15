# Isolation Boundary — `createRouteMenuIsolationBoundary`

Describes and asserts the boundary that separates the dev-preview route/menu from the
production application.

## The boundary holds that the runtime

- does **not** touch `App.jsx`, `src/pages`, `src/components`, `src/modules`, or
  Empresas;
- does **not** wire the product router or product menu;
- does **not** import `react-router` or `react-dom`;
- does **not** use `window`/`document`/`createRoot` (mount is DI-only);
- does **not** relink the old Studio prototype;
- does **not** read or write real data / backend / Prisma;
- stays inside the `/__dev/studio/preview` namespace.

The boundary model returns a frozen descriptor of these invariants plus a
`boundaryIntact` flag; the verifier and gate assert it. Because every crossing is
denied by construction, the feature is reversible by simple non-consumption.
