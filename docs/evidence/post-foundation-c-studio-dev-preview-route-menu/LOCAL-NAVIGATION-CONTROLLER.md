# Local Navigation Controller — `createIsolatedNavigationController`

Provides in-memory navigation **inside** the isolated host only. It tracks the
current isolated path, resolves it via the route resolver, and notifies subscribers
on change.

- `navigateLocal(path)` updates the local path and re-resolves the screen; it never
  touches browser history, `window.location`, `pushState`, or `react-router`
  `useNavigate`.
- Navigation is confined to the `/__dev/studio/preview` namespace; anything else
  resolves to the not-found screen.
- Emits change notifications the mount adapter uses to re-render through the injected
  root.

The controller is the only mutation surface, and its mutations are local state
transitions — no external system is affected.
