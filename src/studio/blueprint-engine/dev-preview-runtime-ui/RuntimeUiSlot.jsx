import { RuntimeUiPlaceholder } from './RuntimeUiPlaceholder.jsx';

/**
 * Isolated slot node. Renders a local placeholder for a synthetic row/field metadata. Pure and
 * presentational. No real data, no side effects.
 *
 * @param {{ slotId?: string, nodeKind?: string, rows?: Array<Object>, style?: Object }} props
 */
export function RuntimeUiSlot({ slotId = 'slot', nodeKind = 'uiTable', rows = [], style }) {
  return (
    <div data-runtime-ui-node={nodeKind} data-slot-id={slotId} style={style}>
      {rows.length === 0
        ? <RuntimeUiPlaceholder label="sem dados sintéticos" nodeKind="uiEmptyState" />
        : rows.map((r, i) => (
          <RuntimeUiPlaceholder key={r && r.id ? String(r.id) : String(i)} label={`linha sintética ${i + 1}`} nodeKind="uiField" />
        ))}
    </div>
  );
}

export default RuntimeUiSlot;
