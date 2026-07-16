# Lazy Import & Production Bundle Absence

## Mechanism

`src/App.jsx` wraps the dynamic import behind a build-time `import.meta.env.DEV`:

```js
const StudioDevPreviewAppRoute = import.meta.env.DEV
  ? lazy(() => import("@/studio/blueprint-engine/dev-preview-app-integration/StudioDevPreviewAppBoundary.jsx"))
  : null;
{StudioDevPreviewAppRoute && shouldMountStudioDevPreviewRoute() && ( <Route … /> )}
```

In a production build Vite replaces `import.meta.env.DEV` with `false`, so Rollup evaluates the
const to `null`, the `null && …` route block becomes dead code, and the (now unused) guard imports
are tree-shaken — eliminating the dynamic import chunk **and** the guard strings.

## Empirical evidence (production build of this branch)

`grep -rl … dist/` returns **0 files** for every exclusive marker:

- `studio-dev-preview-route-menu` → 0
- `studio-dev-preview-app-integration` → 0
- `__dev/studio/preview` → 0
- `shouldMountStudioDevPreviewRoute` → 0
- `StudioDevPreviewAppBoundary` → 0
- `StudioDevPreviewRouteMenuHost` / `data-studio-dev-preview` → 0

No dedicated preview chunk file is emitted in `dist/assets/`. The pre-existing sanctioned mounts
(`__dev/runtime-v2`, `__dev/modelobase2`) remain in the bundle unchanged — this slice touched
neither. This is **stricter than the precedent**: the Studio preview leaves no production trace.

The slice gate runs a production build and re-asserts these absences; `capabilities.
productionBundleContainsPreview` is `false`.
