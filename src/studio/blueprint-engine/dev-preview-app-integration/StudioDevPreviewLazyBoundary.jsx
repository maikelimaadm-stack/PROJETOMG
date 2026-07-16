import { StudioDevPreviewFailureBoundary } from './StudioDevPreviewFailureBoundary.jsx';
import { StudioDevPreviewFallback } from './StudioDevPreviewFallback.jsx';

/**
 * Presentational lazy boundary that composes the local failure boundary + safe fallback around the
 * lazily-loaded preview children. Automatic JSX runtime (no React import). It performs no loading
 * itself — the App wraps the route element in `<Suspense>` and lazy-loads the module behind a
 * build-time `import.meta.env.DEV` guard so the production bundle strips the preview chunk. This
 * component only provides a local, safe presentational shell. It mounts nothing and touches no
 * window/document.
 *
 * @param {{ children?: unknown, hasError?: boolean, error?: unknown, style?: Object }} props
 */
export function StudioDevPreviewLazyBoundary({ children = null, hasError = false, error = null, style }) {
  return (
    <div data-studio-dev-preview-app="lazy-boundary" style={style}>
      <StudioDevPreviewFailureBoundary hasError={hasError} error={error}>
        {children ?? <StudioDevPreviewFallback reason="not_loaded" />}
      </StudioDevPreviewFailureBoundary>
    </div>
  );
}

export default StudioDevPreviewLazyBoundary;
