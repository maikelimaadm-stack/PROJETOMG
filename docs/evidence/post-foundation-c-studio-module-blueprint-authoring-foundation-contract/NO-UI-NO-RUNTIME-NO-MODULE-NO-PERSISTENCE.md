# No UI, No Runtime, No Module, No Persistence

This slice is a **contract, not an implementation**. It asserts (verified by static scans in the test
and gate, and by capability flags):

- **No UI**: no `.jsx`/`.tsx`/`.css`, no React import, no `createElement`/JSX, no component, no
  editor, no form builder, no drag-and-drop.
- **No runtime authoring**: no authoring runtime, no mutable state machine driving behavior.
- **No module**: no `src/modules/studio`, no module file, no module registration, no generated file.
- **No persistence**: no storage, no backend, no Prisma, no migration, no schema, no endpoint.
- **No App/router/menu/route/sidebar**: no App wiring; `src/App.jsx` untouched; no
  `Route`/`Routes`/`BrowserRouter`/`createBrowserRouter`/`useNavigate`; no `ReactDOM`/`createRoot`;
  no `window`/`document`.
- **No network / real data**: no `fetch`/XHR/WebSocket, no `DATABASE_URL`/production API_URL, no
  POST/PUT/PATCH/DELETE, no real data read/write, no Empresas rewrite.
- **No product/production/staging exposure.**

The layer is pure, deterministic, and reversible by non-consumption.
