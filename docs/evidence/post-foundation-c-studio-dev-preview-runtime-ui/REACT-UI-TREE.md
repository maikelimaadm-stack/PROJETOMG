# React UI Tree — Studio Dev Preview Runtime UI

Part of the DEV-ONLY, ISOLATED Studio Dev Preview Runtime UI. Describes the isolated React/JSX tree as deterministic metadata (component names + node kinds). Real renderable components are the sibling .jsx files (RuntimeUiRoot/Screen/Section/Slot/Placeholder/BlockedActionBanner). reactComponentCreated/jsxCreated true; tsxCreated/domNodeCreated/reactDomUsed/createRootUsed/mountedToRealDom false.

This UI is dev-only and isolated; real React/JSX exists but confined to the authorized subtree;
no App wiring; no route/menu wiring; no real module; no backend/Prisma; no Empresas; no
src/modules; no production/staging; no real mutation; data is synthetic only; the old Studio
prototype was NOT imported or relinked.
