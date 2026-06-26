import {
  buildEmpresaColumnFilters,
  buildEmpresaPanelFilters,
  mergeEmpresaListFilters,
} from "@/shared/listing/buildEmpresaListFilters";
import { buildCadcpsColumnFilters } from "@/shared/listing/buildCadcpsColumnFilters";

/** @type {Record<string, { buildColumnFilters?: Function, buildPanelFilters?: Function, merge?: Function }>} */
const MODULE_FILTER_BUILDERS = {
  empresas: {
    buildColumnFilters: buildEmpresaColumnFilters,
    buildPanelFilters: buildEmpresaPanelFilters,
    merge: mergeEmpresaListFilters,
  },
  cadcps: {
    buildColumnFilters: buildCadcpsColumnFilters,
    buildPanelFilters: () => ({}),
    merge: (...parts) => Object.assign({}, ...parts.filter(Boolean)),
  },
};

export function getMakListFilterBuilder(moduleId) {
  const builder = MODULE_FILTER_BUILDERS[String(moduleId || "").trim()];
  if (!builder) {
    throw new Error(`buildMakListFilters: unknown moduleId "${moduleId}"`);
  }
  return builder;
}

export function buildMakColumnFilters(moduleId, filtrosColunas = {}) {
  const builder = getMakListFilterBuilder(moduleId);
  return builder.buildColumnFilters?.(filtrosColunas) ?? {};
}

export function buildMakPanelFilters(moduleId, filterValues = {}) {
  const builder = getMakListFilterBuilder(moduleId);
  return builder.buildPanelFilters?.(filterValues) ?? {};
}

export function mergeMakListFilters(moduleId, ...parts) {
  const builder = getMakListFilterBuilder(moduleId);
  if (builder.merge) return builder.merge(...parts);
  return Object.assign({}, ...parts.filter(Boolean));
}

/** Registra builder de filtros para novos módulos MAK. */
export function registerMakListFilterBuilder(moduleId, builder) {
  MODULE_FILTER_BUILDERS[String(moduleId || "").trim()] = builder;
}
