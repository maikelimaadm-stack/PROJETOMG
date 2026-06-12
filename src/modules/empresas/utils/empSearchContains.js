import { getEmpSearchFieldValue } from "@/modules/empresas/components/empSearchView.constants";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

export { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

export function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function textContainsSearchQuery(text, query) {
  const term = normalizeSearchQuery(query);
  if (!term) return true;

  const source = text == null || text === "—" ? "" : String(text);
  if (!source) return false;

  return normalizeSearchText(source).includes(normalizeSearchText(term));
}

/** Campos pesquisáveis: código, nome e detalhes visíveis na listagem. */
export function buildEmpSearchFieldKeys(detailFields = []) {
  const keys = new Set(["codempresa", "razao_social"]);
  detailFields.forEach((field) => {
    if (field?.key) keys.add(field.key);
  });
  return [...keys];
}

export function empresaMatchesContainsSearch(emp, query, fieldKeys = []) {
  const term = normalizeSearchQuery(query);
  if (!term) return true;
  if (!emp) return false;

  return fieldKeys.some((key) => {
    const display = getEmpSearchFieldValue(emp, key);
    return textContainsSearchQuery(display, term);
  });
}

export function filterEmpresasContains(empresas, query, fieldKeys = []) {
  const term = normalizeSearchQuery(query);
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
