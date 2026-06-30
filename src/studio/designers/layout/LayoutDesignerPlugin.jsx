import { useCallback } from "react";
import { LayoutDocumentProvider, useLayoutDocument } from "./LayoutDocumentProvider.jsx";
import { LayoutCanvas } from "./canvas/LayoutCanvas.jsx";
import { useSelection } from "@/studio/domain/hooks/useSelection.js";
import { createStudioSelection } from "@/studio/domain/contracts/selectionModel.js";

function LayoutDesignerWorkspaceInner({ sdk, hub }) {
  const { document, commandBus, loading, selectedComponentId, setSelectedComponentId } = useLayoutDocument();
  const { selectEntry } = useSelection();

  const handleSelectComponent = useCallback(
    (component) => {
      setSelectedComponentId(component.componentId);
      selectEntry(
        createStudioSelection({
          selectionKind: "component",
          targetId: component.componentId,
          entryId: component.componentId,
          entryType: "component",
          moduleId: document.moduleId,
          designerId: "layout",
          metadata: { sectionId: component.sectionId },
        })
      );
    },
    [document.moduleId, selectEntry, setSelectedComponentId]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Carregando Layout Document…
      </div>
    );
  }

  return (
    <LayoutCanvas
      document={document}
      selectedComponentId={selectedComponentId}
      onSelectComponent={handleSelectComponent}
      commandBus={commandBus}
      sdk={sdk}
      hub={hub}
    />
  );
}

/** Layout Studio designer plugin mount — Program 2.2 */
export function LayoutDesignerPlugin({ moduleId, sdk, hub, onValidationChange, onPreviewChange }) {
  return (
    <LayoutDocumentProvider
      moduleId={moduleId}
      sdk={sdk}
      hub={hub}
      onValidationChange={onValidationChange}
      onPreviewChange={onPreviewChange}
    >
      <LayoutDesignerWorkspaceInner sdk={sdk} hub={hub} />
    </LayoutDocumentProvider>
  );
}

export default LayoutDesignerPlugin;
