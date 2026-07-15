# Isolated Menu Registry — `createIsolatedMenuRegistry`

Holds the dev-preview menu entries in a private registry, entirely separate from the
product sidebar/menu.

- **No product menu:** never calls `registerProductMenu`, `registerSidebarItem`, or
  any App navigation API.
- Menu items point only at isolated `/__dev/studio/preview…` routes.
- Immutable snapshots; deterministic ordering.

Visibility of these entries is decided by `createMenuVisibilityDecision`, which is
itself bound to the dev-only feature gate — so the menu is invisible unless the gate
is open.
