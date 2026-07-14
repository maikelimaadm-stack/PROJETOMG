import { RuntimeUiScreen } from './RuntimeUiScreen.jsx';

/**
 * Root of the isolated dev-only runtime UI. It renders a single local screen from a runtime UI
 * contract's synthetic virtual frame. Pure and presentational — it never mounts itself (no
 * ReactDOM / createRoot), never touches window/document, never wires App/router/menu, and never
 * imports the old Studio prototype. It is only a React element factory local to this subtree.
 *
 * @param {{ runtimeUi?: Object, style?: Object }} props
 */
export function RuntimeUiRoot({ runtimeUi, style }) {
  const vf = runtimeUi && runtimeUi.virtualFrameInput ? runtimeUi.virtualFrameInput : {};
  const blocked = runtimeUi && runtimeUi.blockedActionModel && Array.isArray(runtimeUi.blockedActionModel.actions)
    ? runtimeUi.blockedActionModel.actions
    : [];
  const sections = [
    { title: 'Preview sintético', slots: [{ slotId: 'main', nodeKind: 'uiTable', rows: [] }] },
  ];
  return (
    <div data-runtime-ui-node="uiRoot" data-dev-only="true" style={style}>
      <RuntimeUiScreen screenKind={vf.screenKind || 'list'} sections={sections} blockedActions={blocked} />
    </div>
  );
}

export default RuntimeUiRoot;
