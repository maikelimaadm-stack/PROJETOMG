/**
 * Dev-only presentational component — renders the preview diagnostics, the
 * legacy-vs-runtime-v2 differences, the actions/workflows as TEXT metadata
 * only (never as clickable handlers), and the masked metadata. Purely
 * informational; nothing here executes.
 */
export function PreviewDiagnostics({ diagnostics, differences, actions, workflows, metadata }) {
  const d = diagnostics ?? {};
  const diffs = Array.isArray(differences) ? differences : [];
  const actionList = Array.isArray(actions) ? actions : [];
  const workflowList = Array.isArray(workflows) ? workflows : [];
  const metaEntries = Object.entries(metadata ?? {});

  return (
    <section className="mak-dev-preview-diagnostics" data-testid="dev-preview-diagnostics">
      <h3 className="text-sm font-semibold">Diagnostics</h3>

      <ul className="text-xs" data-testid="dev-preview-warnings">
        {(d.warnings ?? []).map((w, i) => (
          <li key={`warn-${i}`}>{w}</li>
        ))}
      </ul>

      <div className="text-xs" data-testid="dev-preview-differences">
        <h4>Differences (legacy vs v2)</h4>
        <ul>
          {diffs.map((diff, i) => (
            <li key={`diff-${i}`}>{diff.path}</li>
          ))}
        </ul>
      </div>

      <div className="text-xs" data-testid="dev-preview-actions">
        <h4>Actions (metadata only)</h4>
        <ul>
          {actionList.map((a) => (
            <li key={a.id}>{a.label}</li>
          ))}
        </ul>
        <h4>Workflows (metadata only)</h4>
        <ul>
          {workflowList.map((w) => (
            <li key={w.id}>{w.label}</li>
          ))}
        </ul>
      </div>

      <div className="text-xs" data-testid="dev-preview-metadata">
        <h4>Metadata</h4>
        <ul>
          {metaEntries.map(([k, v]) => (
            <li key={k}>{`${k}: ${String(v)}`}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PreviewDiagnostics;
