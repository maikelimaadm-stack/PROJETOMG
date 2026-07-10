/**
 * Dev-only presentational card for one module in the runtime v2 preview hub.
 * Renders the module's table/form structure, diagnostics, differences, and
 * actions/workflows as TEXT metadata only. It never executes anything, never
 * binds a handler, never touches real data.
 */
export function RuntimeV2DevPreviewModuleCard({ module }) {
  const m = module ?? {};
  const table = m.table ?? { columns: [] };
  const form = m.form ?? { fields: [] };
  const diagnostics = m.diagnostics ?? {};
  const differences = Array.isArray(m.differences) ? m.differences : [];
  const actions = Array.isArray(m.actions) ? m.actions : [];
  const workflows = Array.isArray(m.workflows) ? m.workflows : [];

  return (
    <article className="mak-dev-hub-card" data-testid={`dev-hub-card-${m.moduleId}`} data-module={m.moduleId}>
      <header className="mak-dev-hub-card-header">
        <h3 className="text-sm font-semibold">{m.moduleName}</h3>
        <p className="text-xs">{`${m.moduleId} · source: ${m.source} · ${m.ok ? 'ok' : 'failed'}`}</p>
      </header>

      <section className="mak-dev-hub-card-table" data-testid={`dev-hub-table-${m.moduleId}`}>
        <h4 className="text-xs font-semibold">{`Table (${table.columns.length} columns)`}</h4>
        <ul className="text-xs">
          {table.columns.map((c) => (
            <li key={c.id}>{`${c.label}${c.sortable ? ' [sortable]' : ''}${c.filterable ? ' [filterable]' : ''}${c.visible ? '' : ' [hidden]'}`}</li>
          ))}
        </ul>
      </section>

      <section className="mak-dev-hub-card-form" data-testid={`dev-hub-form-${m.moduleId}`}>
        <h4 className="text-xs font-semibold">{`Form (${form.fields.length} fields)`}</h4>
        <ul className="text-xs">
          {form.fields.map((f) => (
            <li key={f.id}>{`${f.label} [${f.type}]${f.required ? ' [required]' : ''}${f.permission ? ` [perm: ${f.permission}]` : ''}${f.denied ? ' [denied]' : ''}`}</li>
          ))}
        </ul>
      </section>

      <section className="mak-dev-hub-card-diagnostics" data-testid={`dev-hub-diagnostics-${m.moduleId}`}>
        <h4 className="text-xs font-semibold">Diagnostics</h4>
        <ul className="text-xs">
          {(diagnostics.warnings ?? []).map((w, i) => (
            <li key={`w-${i}`}>{w}</li>
          ))}
        </ul>
        <h4 className="text-xs font-semibold">Differences</h4>
        <ul className="text-xs">
          {differences.map((d, i) => (
            <li key={`d-${i}`}>{d.path}</li>
          ))}
        </ul>
      </section>

      <section className="mak-dev-hub-card-meta" data-testid={`dev-hub-actions-${m.moduleId}`}>
        <h4 className="text-xs font-semibold">Actions / Workflows (metadata only)</h4>
        <ul className="text-xs">
          {actions.map((a) => (
            <li key={`a-${a.id}`}>{a.label}</li>
          ))}
          {workflows.map((w) => (
            <li key={`wf-${w.id}`}>{w.label}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export default RuntimeV2DevPreviewModuleCard;
