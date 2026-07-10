/**
 * Dev-only, READ-ONLY presentational table for the Empresas guarded read UI
 * slice. It renders columns + controlled rows straight from the runtime v2
 * read-only view model. It has NO inline editing, NO selection with side
 * effects, NO real action, and never calls anything. Values are already masked
 * upstream (controlled dataset). Pure props → markup.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel['table']} [props.table]
 */
export function EmpresasGuardedReadTable({ table }) {
  const columns = Array.isArray(table?.columns) ? table.columns : [];
  const rows = Array.isArray(table?.rows) ? table.rows : [];
  return (
    <section className="mak-guarded-read-table" data-testid="empresas-guarded-read-table" aria-readonly="true">
      <h3 className="text-sm font-semibold">Empresas — Tabela (read-only)</h3>
      <table className="text-xs">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.id} data-column={c.id}>{c.label ?? c.id}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} data-testid="empresas-guarded-read-table-empty">
                sem linhas controladas
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} data-row={row.id} data-valid={String(row.valid)}>
                {columns.map((c) => (
                  <td key={c.id} className="mak-guarded-read-cell">
                    {formatCell(row.cells ? row.cells[c.id] : '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="mak-guarded-read-note text-xs">Somente leitura — nenhuma edição inline, nenhuma ação real.</p>
    </section>
  );
}

/** @param {unknown} v */
function formatCell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default EmpresasGuardedReadTable;
