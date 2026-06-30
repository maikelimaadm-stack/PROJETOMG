import { getEditorCatalog } from "./catalog/editorCatalog.js";

/**
 * EditorHost — mounts designer workspace via Editor Registry.
 * No designer may implement its own editor shell — register via Editor Engine only.
 */
export function EditorHost({ designerId, context }) {
  const registry = getEditorCatalog();
  const mounted = registry.mount(designerId, context);
  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Editor não registrado: {designerId}
      </div>
    );
  }
  return mounted;
}

export default EditorHost;
