import { RuntimeUiSlot } from './RuntimeUiSlot.jsx';

/**
 * Isolated section node grouping local slots. Pure and presentational, synthetic-only.
 *
 * @param {{ title?: string, slots?: Array<Object>, style?: Object }} props
 */
export function RuntimeUiSection({ title = 'seção', slots = [], style }) {
  return (
    <section data-runtime-ui-node="uiSection" aria-label={title} style={style}>
      <h3>{title}</h3>
      {slots.map((s, i) => (
        <RuntimeUiSlot key={s && s.slotId ? String(s.slotId) : String(i)} slotId={s && s.slotId} nodeKind={s && s.nodeKind} rows={s && s.rows} />
      ))}
    </section>
  );
}

export default RuntimeUiSection;
