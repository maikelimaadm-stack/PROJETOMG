import { RuntimeUiSection } from './RuntimeUiSection.jsx';
import { RuntimeUiBlockedActionBanner } from './RuntimeUiBlockedActionBanner.jsx';

/**
 * Isolated screen node. Renders local sections plus the blocked-action banner. Pure and
 * presentational; consumes only synthetic virtual-frame metadata via props.
 *
 * @param {{ screenKind?: string, sections?: Array<Object>, blockedActions?: Array<Object>, style?: Object }} props
 */
export function RuntimeUiScreen({ screenKind = 'list', sections = [], blockedActions = [], style }) {
  return (
    <div data-runtime-ui-node="uiRegion" data-screen-kind={screenKind} style={style}>
      {sections.map((sec, i) => (
        <RuntimeUiSection key={sec && sec.title ? String(sec.title) : String(i)} title={sec && sec.title} slots={sec && sec.slots} />
      ))}
      <RuntimeUiBlockedActionBanner actions={blockedActions} />
    </div>
  );
}

export default RuntimeUiScreen;
