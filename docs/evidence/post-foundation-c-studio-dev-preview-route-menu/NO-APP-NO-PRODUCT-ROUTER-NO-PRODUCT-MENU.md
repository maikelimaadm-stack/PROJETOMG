# No App · No Product Router · No Product Menu

This slice makes **zero** changes to the production application surface:

- **App.jsx untouched** — no route, host, or import added to `App.jsx`.
- **No product router wiring** — no `<Route>`/`<Routes>`/`createBrowserRouter`/
  `BrowserRouter`/`useNavigate` from `react-router`; the isolated routes live only in
  the private registry/resolver.
- **No product menu** — no `registerProductMenu`/`registerSidebarItem`; the menu
  lives only in the isolated menu registry, visible only when the dev gate is open.
- **No `src/pages`, `src/components`, `src/modules`, Empresas, backend, Prisma,
  migrations, `vite.config.*`, `index.html`** changes.

The verifier's `mustBeFalse` set (`appWiringImplemented`, `browserRouteRegistered`,
`productRouterWiringImplemented`, `productMenuRegistered`, `productSidebarRegistered`)
and the gate's scan enforce this. The only mount path is explicit dependency
injection into an isolated host outside the App.
