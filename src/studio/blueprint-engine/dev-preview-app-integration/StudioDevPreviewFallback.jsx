/**
 * Local, safe dev-only fallback for the Studio Dev Preview route. Presentational only. Automatic JSX
 * runtime (no React import). It renders nothing from real data, mounts nothing, and touches no
 * window/document. Shown when the preview is unavailable or an error was contained locally.
 *
 * @param {{ reason?: string, style?: Object }} props
 */
export function StudioDevPreviewFallback({ reason = 'unavailable', style }) {
  return (
    <div data-studio-dev-preview-app="fallback" data-reason={reason} style={style}>
      <p>Studio dev preview indisponível (dev-only, {String(reason)}).</p>
    </div>
  );
}

export default StudioDevPreviewFallback;
