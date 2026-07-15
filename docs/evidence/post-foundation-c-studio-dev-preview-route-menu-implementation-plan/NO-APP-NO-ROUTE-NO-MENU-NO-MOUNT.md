# No App / No Route / No Menu / No Mount — Studio Dev Preview Route/Menu Implementation Plan

This slice is a PLAN. It implements no route/menu wiring. It explicitly does NOT:
- create a real route/menu/router;
- wire App.jsx, routes, menus, navigation, sidebar or shell;
- use `Route`/`Routes`/`Link`/`NavLink`/`BrowserRouter`/`createBrowserRouter`/`useNavigate`;
- mount the runtime UI (no `ReactDOM`, no `createRoot`, no `window`, no `document`, no mount target);
- create a deep link;
- generate or register a real module; write under `src/modules`;
- touch backend / Prisma / migration / endpoint; access production / staging;
- execute mutation; read or write real data; rewrite Empresas.

The old Studio prototype is NOT imported, relinked, copied or moved. A future real route/menu
wiring requires `FABLE 5 — PRE-ROUTE/MENU IMPLEMENTATION ENTERPRISE CHECKPOINT`. Reversible by
non-consumption.
