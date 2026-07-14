# Next Slice Spec

The natural successor is the **STUDIO DEV PREVIEW VISUAL CONTRACT** slice, which would
consume this bridge's `visualAdapterContract` + `allowedComponentContract` to produce a
sandboxed, still-headless visual preview description — WITHOUT creating real React
components, routes, menus, modules, or any production/backend/Prisma/persistence surface.

Entry marker exposed by this slice: `downstreamSlice = ready_for_dev_preview_visual_contract_slice`.

Remaining permanently blocked until an explicit, separately-authorized slice:
real UI/React/JSX/TSX, real routes/menus, module generation, backend/Prisma/migration,
mutation, persistence, production/staging, and any rewrite of Empresas.
