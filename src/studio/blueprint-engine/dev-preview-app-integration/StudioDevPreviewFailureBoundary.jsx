import { StudioDevPreviewFallback } from './StudioDevPreviewFallback.jsx';

/**
 * Defensive, presentational failure boundary for the isolated dev-only preview. Automatic JSX
 * runtime (no React import, no class component — the repo keeps the blueprint-engine subtree
 * React-import-free). Render-time error catching is provided by the App's existing
 * `GlobalErrorBoundary` (which already wraps the router); this component contains a KNOWN error
 * locally by rendering the safe fallback instead of the children when an `error`/`hasError` prop is
 * passed, so a preview failure never propagates a broken tree upward. It mounts nothing, touches no
 * window/document, and reads no real data.
 *
 * @param {{ hasError?: boolean, error?: unknown, children?: unknown, style?: Object }} props
 */
export function StudioDevPreviewFailureBoundary({ hasError = false, error = null, children = null, style }) {
  if (hasError === true || error) {
    return (
      <div data-studio-dev-preview-app="failure-boundary" data-contained="true" style={style}>
        <StudioDevPreviewFallback reason="contained_error" />
      </div>
    );
  }
  return (
    <div data-studio-dev-preview-app="failure-boundary" data-contained="false" style={style}>
      {children}
    </div>
  );
}

export default StudioDevPreviewFailureBoundary;
