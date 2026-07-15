/**
 * Isolated local menu for the dev-only route/menu host. It renders local items and calls the
 * injected `onNavigateLocal` handler (which drives only the host's local navigation controller). It
 * never registers a product menu/sidebar, never mutates browser history. Automatic JSX runtime.
 *
 * @param {{ items?: Array<{menuId:string,label:string,path:string}>, onNavigateLocal?: (path:string)=>void, style?: Object }} props
 */
export function StudioDevPreviewMenu({ items = [], onNavigateLocal, style }) {
  const handle = typeof onNavigateLocal === 'function' ? onNavigateLocal : () => {};
  return (
    <nav data-studio-dev-preview="menu" aria-label="Studio Dev Preview (isolado)" style={style}>
      <ul>
        {items.map((it) => (
          <li key={it.menuId}>
            <button type="button" data-menu-id={it.menuId} onClick={() => handle(it.path)}>{it.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default StudioDevPreviewMenu;
