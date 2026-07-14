# No React / No UI / No Route / No Module — Studio Dev Preview Runtime UI Implementation Plan

This slice is a PLAN. It **implements no UI runtime**. It creates:
- no React component, no `.jsx`, no `.tsx`, no `.css`, no DOM, no runtime CSS;
- no route, no placement, no menu;
- no module, nothing written under `src/modules`, no module registration;
- no backend / Prisma / migration / endpoint access;
- no fetch / HTTP / mutation / persistence;
- no production / staging access; no real data read/write; no Empresas rewrite.

The old Studio prototype in the repo is **not** imported, relinked, reactivated, moved, edited or
consumed by this slice. Everything here is deterministic metadata, reversible by non-consumption,
and authorizes nothing real. A future real UI runtime implementation requires a separate slice
after the `pre_runtime_ui_implementation_enterprise_checkpoint`.
