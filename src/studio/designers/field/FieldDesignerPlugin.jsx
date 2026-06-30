import { useCallback } from "react";
import { FieldDocumentProvider, useFieldDocument } from "./FieldDocumentProvider.jsx";
import { FieldCanvas } from "./canvas/FieldCanvas.jsx";
import { useSelection } from "@/studio/domain/hooks/useSelection.js";
import { useProperties } from "@/studio/domain/hooks/useProperties.js";
import { createStudioSelection } from "@/studio/domain/contracts/selectionModel.js";
import { buildFieldPropertyFields } from "./fieldPropertyFields.js";

function FieldDesignerWorkspaceInner({ sdk, hub }) {
  const { document, commandBus, loading, selectedFieldNodeId, setSelectedFieldNodeId } = useFieldDocument();
  const { selectEntry } = useSelection();
  const { setFields } = useProperties();

  const handleSelectField = useCallback(
    (field) => {
      setSelectedFieldNodeId(field.fieldNodeId);
      selectEntry(
        createStudioSelection({
          selectionKind: "field",
          targetId: field.fieldNodeId,
          entryId: field.fieldNodeId,
          entryType: "field",
          moduleId: document.moduleId,
          designerId: "field",
          metadata: { fieldName: field.fieldName, fieldType: field.fieldType },
        })
      );
      setFields(buildFieldPropertyFields(field), field.fieldNodeId);
    },
    [document.moduleId, selectEntry, setSelectedFieldNodeId, setFields]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Carregando Field Document…
      </div>
    );
  }

  return (
    <FieldCanvas
      document={document}
      selectedFieldNodeId={selectedFieldNodeId}
      onSelectField={handleSelectField}
      commandBus={commandBus}
      sdk={sdk}
      hub={hub}
    />
  );
}

/** Field Studio designer plugin mount — Program 2.3 */
export function FieldDesignerPlugin({ moduleId, sdk, hub, onValidationChange, onPreviewChange }) {
  return (
    <FieldDocumentProvider
      moduleId={moduleId}
      sdk={sdk}
      hub={hub}
      onValidationChange={onValidationChange}
      onPreviewChange={onPreviewChange}
    >
      <FieldDesignerWorkspaceInner sdk={sdk} hub={hub} />
    </FieldDocumentProvider>
  );
}

export default FieldDesignerPlugin;
