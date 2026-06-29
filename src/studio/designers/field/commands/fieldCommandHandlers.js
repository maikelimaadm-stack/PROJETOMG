import { FieldCommandTypes } from "./fieldCommandTypes.js";
import { applyFieldProperty } from "../som/fieldSomSetup.js";
import { generateFieldNodeId } from "../som/fieldSomSetup.js";

function getMainGroup(doc) {
  if (!doc.groups?.length) {
    doc.groups = [{ groupId: "group.main", label: "Campos personalizados", fields: [] }];
  }
  return doc.groups[0];
}

function findFieldIndex(group, fieldNodeId) {
  return (group.fields ?? []).findIndex((f) => f.fieldNodeId === fieldNodeId);
}

/** Field-specific command apply handler — used by Studio Core Command Engine */
export function applyFieldCommand(doc, command) {
  const next = doc;
  const group = getMainGroup(next);
  group.fields = group.fields ?? [];

  switch (command.type) {
    case FieldCommandTypes.ADD_FIELD: {
      const { fieldType, label, fieldName } = command.payload;
      const safeName =
        fieldName ??
        `campo_${Date.now()}`.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
      const fieldNodeId = generateFieldNodeId(next.moduleId, safeName, true);
      const fieldId = `${next.moduleId}.${next.entityId?.toLowerCase()}.${safeName}`;
      group.fields = [
        ...group.fields,
        {
          fieldNodeId,
          mdpRowId: null,
          fieldId,
          fieldName: safeName,
          entityId: next.entityId,
          fieldType: fieldType ?? "string",
          source: "custom",
          label: label ?? safeName,
          required: false,
          readOnly: false,
          active: true,
          visibleForm: true,
          visibleTable: false,
          sortOrder: group.fields.length,
          labels: [{ locale: "pt-BR", label: label ?? safeName }],
          _pendingCreate: true,
        },
      ];
      break;
    }
    case FieldCommandTypes.DELETE_FIELD: {
      const idx = findFieldIndex(group, command.payload.fieldNodeId);
      if (idx < 0) break;
      const field = group.fields[idx];
      if (field.mdpRowId) {
        group.fields[idx] = { ...field, _pendingDelete: true };
      } else {
        group.fields = group.fields.filter((_, i) => i !== idx);
      }
      break;
    }
    case FieldCommandTypes.REORDER_FIELD: {
      const idx = findFieldIndex(group, command.payload.fieldNodeId);
      if (idx < 0) break;
      const list = [...group.fields];
      const [item] = list.splice(idx, 1);
      list.splice(command.payload.toIndex, 0, item);
      group.fields = list.map((f, i) => ({ ...f, sortOrder: i }));
      break;
    }
    case FieldCommandTypes.UPDATE_PROPERTY: {
      const idx = findFieldIndex(group, command.payload.fieldNodeId);
      if (idx < 0) break;
      const updated = applyFieldProperty(group.fields[idx], command.payload.propertyId, command.payload.value);
      if (command.payload.propertyId === "label") {
        updated.labels = [{ locale: "pt-BR", label: command.payload.value }];
      }
      group.fields[idx] = updated;
      break;
    }
    default:
      break;
  }

  return next;
}

export default applyFieldCommand;
