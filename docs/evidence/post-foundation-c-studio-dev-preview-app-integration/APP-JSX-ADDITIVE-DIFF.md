# App.jsx — Additive Diff

The `src/App.jsx` change is **purely additive**: **0 existing lines removed, 0 modified, 16 added**.

## Added blocks (3)

1. A DEV-ONLY import of `shouldMountStudioDevPreviewRoute` + `STUDIO_DEV_PREVIEW_ROUTE_PATH`
   (after the existing ModeloBase2 fuel dev import).
2. A build-time-guarded lazy const:
   ```js
   const StudioDevPreviewAppRoute = import.meta.env.DEV
     ? lazy(() => import("@/studio/blueprint-engine/dev-preview-app-integration/StudioDevPreviewAppBoundary.jsx"))
     : null;
   ```
3. A conditional `<Route path={STUDIO_DEV_PREVIEW_ROUTE_PATH} …>` guarded by
   `StudioDevPreviewAppRoute && shouldMountStudioDevPreviewRoute()`, inserted before the catch-all
   `path="*"` route.

## Invariants

- No existing route, provider, auth, layout, or state wiring is touched.
- No new router / `BrowserRouter` / `createBrowserRouter` is created.
- No menu/sidebar/navigation entry is added (`addMenuItem`/`navItems`/`menu.push` absent).
- The only added `path=` line uses the dev-only path constant.
- No forbidden token (prisma/backend/fetch/storage/menu) is added.

The `productionUiGuard`'s `appJsxChangeIsOnlyDevRouteMount` enforces this (0 removed lines, marker
present, path allowlisted, no forbidden token) and the slice gate re-asserts it.
