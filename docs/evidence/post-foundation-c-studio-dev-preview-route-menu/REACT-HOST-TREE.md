# React Host Tree — `.jsx` graph + `createRouteMenuReactHostTree`

## Real React host (`.jsx`)

Five `.jsx` components form the real, isolated host graph:

- `StudioDevPreviewRouteMenuHost.jsx` — root host;
- `StudioDevPreviewMenu.jsx` — isolated menu;
- `StudioDevPreviewRouteView.jsx` — matched route screen;
- `StudioDevPreviewNotFound.jsx` — not-found screen;
- `StudioDevPreviewBlocked.jsx` — blocked/fail-closed screen.

They use the **automatic JSX runtime** (no `import React`), import only local
siblings, and reference no `react-dom`, `react-router`, `window`, or `document`.

## Why `.jsx` stays out of the `.js` graph

`node --test` cannot parse JSX. The `.js` runtime graph (including `index.js` and the
composer) never statically imports a `.jsx` file; instead
`createRouteMenuReactHostTree` describes the host as a **plain descriptor**
(component names + slots), and the mount adapter renders that descriptor through the
injected root. This keeps the whole `.js` tree node-test-parseable and keeps the
engine-foundation "React-free import" scan green.
