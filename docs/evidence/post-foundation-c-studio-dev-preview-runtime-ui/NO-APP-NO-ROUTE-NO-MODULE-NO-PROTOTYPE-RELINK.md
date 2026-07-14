# No App / No Route / No Module / No Prototype Relink — Studio Dev Preview Runtime UI

This slice implements a REAL but ISOLATED UI runtime. It explicitly does NOT:
- wire App.jsx, routes, menus, or any module;
- mount to the real DOM (no ReactDOM, no createRoot, no window, no document);
- create `.tsx` or `.css`;
- generate or register a real module; write under `src/modules`;
- touch backend / Prisma / migration / endpoint; access production / staging;
- execute real mutation / navigation / submit / save; read or write real data; rewrite Empresas.

CRITICAL — the old Studio prototype is NOT imported, relinked, copied, moved or reused. This
subtree imports nothing from:
`src/studio/components/`, `src/studio/shell/`, `src/studio/designers/`, `src/studio/pages/`,
`src/studio/navigation/`, `src/studio/dock/`, `src/studio/panels/`, `src/studio/editor/`,
`src/components/`, `src/pages/`, or `src/App.jsx`. The `.jsx` components import only React and
their local siblings. Everything is dev-only, synthetic-only, and reversible by non-consumption.
