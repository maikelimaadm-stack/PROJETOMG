import { FieldCommandTypes } from "./fieldCommandTypes.js";
import { applyFieldProperty } from "../som/fieldSomSetup.js";
import { generateFieldNodeId } from "../som/fieldSomSetup.js";
import { applySmartFieldTemplate } from "../templates/applySmartFieldTemplate.js";
import { getBusinessFieldType } from "../businessTypes/businessTypeCatalog.js";
import { buildFieldPresentation } from "../document/fieldPresentationAdapter.js";

function ensureGroups(doc) {
  if (!doc.groups?.length) {
    doc.groups = [{ groupId: "group.main", label: "Campos personalizados", category: "geral", fields: [] }];
  }
  doc.groups.forEach((g) => {
    if (!g.fields) g.fields = [];
  });
  return doc.groups;
}

function findGroup(doc, groupId = "group.main") {
  ensureGroups(doc);
  return doc.groups.find((g) => g.groupId === groupId) ?? doc.groups[0];
}

function findFieldLocation(doc, fieldNodeId) {
  ensureGroups(doc);
  for (const group of doc.groups) {
    const idx = (group.fields ?? []).findIndex((f) => f.fieldNodeId === fieldNodeId);
    if (idx >= 0) return { group, idx };
  }
  return null;
}

function createBaseFieldNode(doc, partial) {
  const fieldNodeId = generateFieldNodeId(doc.moduleId, partial.fieldName, true);
  const fieldId = `${doc.moduleId}.${doc.entityId?.toLowerCase()}.${partial.fieldName}`;
  return {
    fieldNodeId,
    mdpRowId: null,
    fieldId,
    entityId: doc.entityId,
    source: "custom",
    sortOrder: partial.sortOrder ?? 0,
    labels: partial.labels ?? [{ locale: "pt-BR", label: partial.label ?? partial.fieldName }],
    _pendingCreate: true,
    presentation: buildFieldPresentation(partial),
    ...partial,
  };
}

/** Field-specific command apply handler — used by Studio Core Command Engine */
export function applyFieldCommand(doc, command) {
  const next = doc;
  ensureGroups(next);

  switch (command.type) {
    case FieldCommandTypes.ADD_FIELD: {
      const { fieldType, label, fieldName, groupId } = command.payload;
      const group = findGroup(next, groupId);
      const safeName =
        fieldName ?? `campo_${Date.now()}`.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
      const node = createBaseFieldNode(next, {
        fieldName: safeName,
        fieldType: fieldType ?? "string",
        label: label ?? safeName,
        groupId: group.groupId,
        required: false,
        readOnly: false,
        active: true,
        visibleForm: true,
        visibleTable: false,
        sortOrder: group.fields.length,
      });
      group.fields = [...group.fields, node];
      break;
    }
    case FieldCommandTypes.ADD_FIELD_FROM_TEMPLATE: {
      const { templateId, groupId } = command.payload;
      const group = findGroup(next, groupId);
      const templateProps = applySmartFieldTemplate(templateId, { groupId: group.groupId });
      const node = createBaseFieldNode(next, {
        ...templateProps,
        sortOrder: group.fields.length,
      });
      group.fields = [...group.fields, node];
      break;
    }
    case FieldCommandTypes.ADD_FIELD_FROM_BUSINESS_TYPE: {
      const { businessTypeId, groupId } = command.payload;
      const bt = getBusinessFieldType(businessTypeId);
      if (!bt) break;
      const group = findGroup(next, groupId);
      const safeName = `${businessTypeId}_${Date.now()}`.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
      const node = createBaseFieldNode(next, {
        fieldName: safeName,
        fieldType: "reference",
        label: bt.label,
        groupId: group.groupId,
        category: bt.category,
        businessTypeId: bt.businessTypeId,
        icon: bt.icon,
        helpText: bt.description ?? `Tipo de negócio: ${bt.label} (referência futura)`,
        required: false,
        readOnly: false,
        active: true,
        visibleForm: true,
        visibleTable: false,
        sortOrder: group.fields.length,
        labels: [{ locale: "pt-BR", label: bt.label, description: bt.description ?? null }],
      });
      group.fields = [...group.fields, node];
      break;
    }
    case FieldCommandTypes.ADD_GROUP: {
      const { groupId, label, category } = command.payload;
      if (next.groups.some((g) => g.groupId === groupId)) break;
      next.groups = [...next.groups, { groupId, label, category: category ?? "geral", fields: [] }];
      break;
    }
    case FieldCommandTypes.ASSIGN_FIELD_GROUP: {
      const loc = findFieldLocation(next, command.payload.fieldNodeId);
      if (!loc) break;
      const targetGroup = findGroup(next, command.payload.groupId);
      const [field] = loc.group.fields.splice(loc.idx, 1);
      field.groupId = targetGroup.groupId;
      field.presentation = buildFieldPresentation(field);
      targetGroup.fields = [...targetGroup.fields, field];
      break;
    }
    case FieldCommandTypes.DELETE_FIELD: {
      const loc = findFieldLocation(next, command.payload.fieldNodeId);
      if (!loc) break;
      const field = loc.group.fields[loc.idx];
      if (field.mdpRowId) {
        loc.group.fields[loc.idx] = { ...field, _pendingDelete: true };
      } else {
        loc.group.fields = loc.group.fields.filter((_, i) => i !== loc.idx);
      }
      break;
    }
    case FieldCommandTypes.REORDER_FIELD: {
      const loc = findFieldLocation(next, command.payload.fieldNodeId);
      if (!loc) break;
      const list = [...loc.group.fields];
      const [item] = list.splice(loc.idx, 1);
      list.splice(command.payload.toIndex, 0, item);
      loc.group.fields = list.map((f, i) => ({ ...f, sortOrder: i }));
      break;
    }
    case FieldCommandTypes.UPDATE_PROPERTY: {
      const loc = findFieldLocation(next, command.payload.fieldNodeId);
      if (!loc) break;
      let updated = applyFieldProperty(loc.group.fields[loc.idx], command.payload.propertyId, command.payload.value);
      if (command.payload.propertyId === "label") {
        updated.labels = [{ locale: "pt-BR", label: command.payload.value, helpText: updated.helpText }];
      }
      if (command.payload.propertyId === "helpText") {
        updated.labels = [{ locale: "pt-BR", label: updated.label, helpText: command.payload.value }];
      }
      updated.presentation = buildFieldPresentation(updated);
      loc.group.fields[loc.idx] = updated;
      break;
    }
    default:
      break;
  }

  return next;
}

export default applyFieldCommand;
