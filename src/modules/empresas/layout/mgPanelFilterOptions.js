import {
  MG_FILTER_FIELDS,
  MG_FILTER_STATUS_FIELD,
} from "@/modules/empresas/layout/mgFilterFields";

export const MG_PANEL_FILTER_FIELDS = [...MG_FILTER_FIELDS, MG_FILTER_STATUS_FIELD];

export function getPanelFilterFieldValue(emp, field) {
  if (!emp || !field) return "-";
  switch (field.key) {
    case "razao_social":
      return emp.razao_social || "-";
    case "nome_fantasia":
      return emp.nome_fantasia || "-";
    case "cnpj":
      return emp.cpf_cnpj || "-";
    case "telefone":
      return emp.telefone || "-";
    case "cidade":
      return emp.cidade || "-";
    case "uf":
      return emp.estado || "-";
    case "status":
      return emp.status || "-";
    default:
      return "-";
  }
}

export function empresaPassesOtherPanelFilters(emp, appliedValues = {}, excludeKey = null) {
  return MG_PANEL_FILTER_FIELDS.every((field) => {
    if (excludeKey && field.key === excludeKey) return true;
    const selected = appliedValues[field.key];
    if (!Array.isArray(selected) || selected.length === 0) return true;
    const value = getPanelFilterFieldValue(emp, field);
    if (value === "-") return false;
    return selected.includes(value);
  });
}

export function buildPanelFilterOptions(empresas = [], appliedValues = {}, fieldKey) {
  const field = MG_PANEL_FILTER_FIELDS.find((item) => item.key === fieldKey);
  if (!field) return [];

  const source = (Array.isArray(empresas) ? empresas : []).filter((emp) =>
    empresaPassesOtherPanelFilters(emp, appliedValues, fieldKey)
  );

  return [
    ...new Set(
      source
        .map((emp) => getPanelFilterFieldValue(emp, field))
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== "" && value !== "-")
    ),
  ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
}
