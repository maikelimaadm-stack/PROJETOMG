# No App · No Router · No Menu · No Mount

This slice is a **contract, not an implementation**. It makes **zero** changes to the production
application surface:

- **App.jsx untouched** — no route, host, import, or bootstrap change.
- **No router wiring** — no `Route`/`Routes`/`Link`/`NavLink`/`BrowserRouter`/`createBrowserRouter`/
  `useNavigate`; the router attachment is described as metadata only.
- **No product menu/sidebar** — menu/route exposure is `false`; nothing is registered.
- **No Runtime UI mount in the App** — no `ReactDOM`/`createRoot`/`window`/`document`; a future
  mount would be explicit dependency-injected only.
- **No `src/pages`, `src/components`, `src/modules`, Empresas, backend, Prisma, migration,
  `vite.config.*`, `index.html`** changes.
- **No prototype relink** — the old Studio prototype is never imported.

The verifier's `mustBeFalse` set and the gate's static scans enforce these guarantees. Real App
integration is deferred to a future, checkpoint-gated implementation plan/slice.
