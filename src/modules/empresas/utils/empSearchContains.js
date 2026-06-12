import { getEmpSearchFieldValue } from "@/modules/empresas/components/empSearchView.constants";

/** Campos pesquisáveis: código, nome e detalhes visíveis na listagem. */
export function buildEmpSearchFieldKeys(detailFields = []) {
  const keys = new Set(["codempresa", "razao_social"]);
  detailFields.forEach((field) => {
    if (field?.key) keys.add(field.key);
  });
  return [...keys];
}

export function empresaMatchesContainsSearch(emp, query, fieldKeys = []) {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return true;
  if (!emp) return false;

  return fieldKeys.some((key) => {
    const display = getEmpSearchFieldValue(emp, key);
    if (!display || display === "—") return false;
    return String(display).toLowerCase().includes(term);
  });
}

export function filterEmpresasContains(empresas, query, fieldKeys = []) {
  const term = String(query || "").trim();
  if (!term) return empresas;
  return (empresas || []).filter((emp) => empresaMatchesContainsSearch(emp, term, fieldKeys));
}

export function paginateEmpresasList(items, page = 1, pageSize = 50) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 50);
  const total = items.length;
  const start = (safePage - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}
