/**
 * ModeloBase2FuelEntriesTable — dev-only sandbox table rendered from
 * `viewModel.table`. Presentational; props-driven. NO backend/fetch/Prisma/
 * runtimeBridge/storage; no side effects. Never mounted in the app by this slice.
 *
 * @param {Object} props
 * @param {{ columns: Array<{ id: string, label: string }>, rows: Array }} props.table
 * @param {(entryId: string) => void} [props.onRemove]
 */
export function ModeloBase2FuelEntriesTable({ table, onRemove }) {
  const columns = table && Array.isArray(table.columns) ? table.columns : [];
  const rows = table && Array.isArray(table.rows) ? table.rows : [];

  if (rows.length === 0) {
    return <div className="mb2-fuel-table mb2-fuel-table--empty">Nenhum lançamento.</div>;
  }

  return (
    <table className="mb2-fuel-table">
      <thead>
        <tr>
          {columns.map((c) => (<th key={c.id} data-col={c.id}>{c.label}</th>))}
          <th aria-label="ações" />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} data-entry={row.id}>
            {columns.map((c) => (
              <td key={c.id} data-col={c.id}>
                {c.id === 'status' ? row.status : String((row.cells && row.cells[c.id]) ?? '')}
              </td>
            ))}
            <td>
              <button type="button" className="mb2-fuel-table__remove" onClick={() => (typeof onRemove === 'function' ? onRemove(row.id) : undefined)}>
                Remover
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ModeloBase2FuelEntriesTable;
