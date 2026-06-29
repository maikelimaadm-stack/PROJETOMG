/**
 * MDP Field Dictionary client — public HTTP API only (Program 2.3 + 2.3.1).
 */
import { apiClient } from "@/apis/http/apiClient.js";
import { buildFieldPresentation } from "@/studio/services/fieldPresentationAdapter.js";

const MDP_API_BASE = "/api/mdp";
const MDP_FIELDS = "fields";

export async function mdpFieldList(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value != null && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return apiClient.get(`${MDP_API_BASE}/${MDP_FIELDS}${qs ? `?${qs}` : ""}`);
}

export async function mdpFieldGet(id) {
  return apiClient.get(`${MDP_API_BASE}/${MDP_FIELDS}/${encodeURIComponent(id)}`);
}

export async function mdpFieldCreate(body) {
  return apiClient.post(`${MDP_API_BASE}/${MDP_FIELDS}`, body);
}

export async function mdpFieldUpdate(id, body) {
  return apiClient.put(`${MDP_API_BASE}/${MDP_FIELDS}/${encodeURIComponent(id)}`, body);
}

export async function mdpFieldDelete(id) {
  return apiClient.delete(`${MDP_API_BASE}/${MDP_FIELDS}/${encodeURIComponent(id)}`);
}

/** Sync field document nodes to MDP Field Dictionary */
export async function mdpFieldSyncDocumentFields(fields = [], { removedIds = [] } = {}) {
  const results = [];
  for (const id of removedIds) {
    try {
      results.push({ action: "delete", id, result: await mdpFieldDelete(id) });
    } catch (err) {
      results.push({ action: "delete", id, ok: false, error: err?.message });
    }
  }
  for (const field of fields) {
    try {
      if (field.mdpRowId && !field._pendingCreate) {
        results.push({
          action: "update",
          fieldName: field.fieldName,
          result: await mdpFieldUpdate(field.mdpRowId, fieldToMdpPayload(field)),
        });
      } else if (field._pendingCreate || !field.mdpRowId) {
        const created = await mdpFieldCreate(fieldToMdpPayload(field));
        results.push({ action: "create", fieldName: field.fieldName, result: created });
      }
    } catch (err) {
      results.push({ action: "sync", fieldName: field.fieldName, ok: false, error: err?.message });
    }
  }
  return results;
}

export function fieldToMdpPayload(field) {
  const presentation = buildFieldPresentation(field);
  const labelEntry = {
    locale: "pt-BR",
    label: field.label ?? field.fieldName,
    helpText: field.helpText ?? null,
    placeholder: field.placeholder ?? null,
    description: field.labels?.[0]?.description ?? null,
  };

  return {
    fieldId: field.fieldId,
    entityId: field.entityId,
    fieldName: field.fieldName,
    source: field.source ?? "custom",
    fieldType: field.fieldType ?? "string",
    labels: field.labels?.length ? field.labels.map((l) => ({ ...l, helpText: field.helpText ?? l.helpText })) : [labelEntry],
    required: field.required ?? false,
    readOnly: field.readOnly ?? false,
    active: field.active ?? true,
    visibleForm: field.visibleForm ?? true,
    visibleTable: field.visibleTable ?? false,
    visibleReport: field.visibleReport ?? false,
    searchable: field.searchable ?? true,
    filterable: field.filterable ?? true,
    exportable: field.exportable ?? true,
    auditable: field.auditable ?? true,
    placeholder: field.placeholder ?? null,
    useMask: field.useMask ?? false,
    maskText: field.maskText ?? null,
    useDecimal: field.fieldType === "number" || field.fieldType === "decimal",
    decimalPlaces: field.precision ?? field.scale ?? undefined,
    presentation: Object.keys(presentation).length ? presentation : undefined,
    sortOrder: field.sortOrder ?? 0,
    tableOrder: field.tableOrder ?? field.sortOrder ?? 999,
  };
}

export default {
  mdpFieldList,
  mdpFieldGet,
  mdpFieldCreate,
  mdpFieldUpdate,
  mdpFieldDelete,
  mdpFieldSyncDocumentFields,
  fieldToMdpPayload,
};
