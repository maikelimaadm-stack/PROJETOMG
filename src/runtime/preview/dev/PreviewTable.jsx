/**
 * Dev-only presentational component — renders the STRUCTURE of the runtime v2
 * table projection (columns + header labels + sortable/filterable metadata).
 * It never renders real data rows, never wires row actions to handlers, never
 * calls anything. Pure structural inspection for development.
 */
export function PreviewTable({ table }) {
  const columns = Array.isArray(table?.columns) ? table.columns : [];
  return (
    <section className="mak-dev-preview-table" data-testid="dev-preview-table">
      <h3 className="text-sm font-semibold">Table Preview</h3>
      <table className="text-xs">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.id} data-column={c.id}>
                {c.label}
                <span className="mak-dev-preview-meta">
                  {c.sortable ? ' [sortable]' : ''}
                  {c.filterable ? ' [filterable]' : ''}
                  {c.visible ? '' : ' [hidden]'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((c) => (
              <td key={c.id} className="mak-dev-preview-cell">structure</td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default PreviewTable;
