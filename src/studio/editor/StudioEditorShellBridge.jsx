import { useEffect, useMemo } from "react";
import { StudioUniversalBridge } from "@/studio/domain/providers/StudioUniversalBridge.jsx";
import { EditorHost, useEditorBridge, EDITOR_HUB_EVENTS } from "@/studio/editor/index.js";
import { useStudioDomain } from "@/studio/domain/providers/StudioDomainProvider.jsx";
import { useSelection } from "@/studio/domain/hooks/useSelection.js";
import { useWorkspace } from "@/studio/domain/hooks/useWorkspace.js";

/**
 * Shell-level bridge — wires Editor Engine into Universal Components without domain → editor inversion.
 */
export function StudioEditorShellBridge(props) {
  const { editor, mode = "production", ...rest } = props;
  const isProduction = mode === "production";
  const { sdk, hub } = useStudioDomain();
  const { selection } = useSelection();
  const { workspace } = useWorkspace();

  const editorBridge = useEditorBridge({
    designerId: workspace.designerId,
    hub,
    isProduction,
    selection,
    propertyGridService: editor?.services?.propertyGrid,
  });

  const editorContext = useMemo(
    () => ({
      moduleId: workspace.moduleId,
      designerId: workspace.designerId,
      sdk,
      hub,
      editor,
      onValidationChange: (validation) => {
        hub?.publish?.(EDITOR_HUB_EVENTS.VALIDATION_CHANGED, {
          designerId: workspace.designerId,
          errorCount: validation.errorCount ?? validation.errors?.length ?? 0,
          warningCount: validation.warningCount ?? validation.warnings?.length ?? 0,
        });
      },
      onPreviewChange: (result) => {
        editor?.services?.preview?.publishChange?.({
          designerId: workspace.designerId,
          message: result?.message ?? null,
          ok: result?.ok !== false,
          compileId: result?.compileId ?? null,
          payload: result ?? {},
        });
        if (result?.ok) {
          hub?.publish?.("preview.refreshed", {
            compileId: result.compileId,
            source: `${workspace.designerId}-document`,
          });
        }
      },
    }),
    [workspace.moduleId, workspace.designerId, sdk, hub, editor]
  );

  const workspaceChildren = editorBridge.hasEditor ? (
    <EditorHost designerId={workspace.designerId} context={editorContext} />
  ) : null;

  useEffect(() => {
    if (editorBridge.hasEditor && editor?.services?.workspace) {
      editor.services.workspace.activate({
        designerId: workspace.designerId,
        moduleId: workspace.moduleId,
      });
    }
  }, [editorBridge.hasEditor, editor, workspace.designerId, workspace.moduleId]);

  return (
    <StudioUniversalBridge
      {...rest}
      mode={mode}
      editorIntegration={{
        hasEditor: editorBridge.hasEditor,
        supportsPropertyEdit: editorBridge.supportsPropertyEdit,
        propertyEmptyState: editorBridge.propertyEmptyState,
        inspectorBindingsLabel: editorBridge.inspectorBindingsLabel,
        editorValidation: editorBridge.editorValidation,
        editorPreviewMessage: editorBridge.editorPreviewMessage,
        onPropertyChange: editorBridge.handlePropertyChange,
        workspaceChildren,
        previewService: editor?.services?.preview,
      }}
    />
  );
}

export default StudioEditorShellBridge;
