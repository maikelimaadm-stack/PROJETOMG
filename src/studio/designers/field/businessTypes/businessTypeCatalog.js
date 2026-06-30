/**
 * Business Field Types Catalog — centralized (Program 2.3.1)
 * Architecture only: no relationship rules, no computed logic.
 */
import { BUSINESS_FIELD_TYPE_VERSION } from "./businessTypeContracts.js";

export { BUSINESS_FIELD_TYPE_VERSION };

/** @type {import('./businessTypeContracts.js').BusinessFieldType[]} */
export const BUSINESS_FIELD_TYPES = Object.freeze([
  { businessTypeId: "cliente", label: "Cliente", icon: "users", category: "comercial", targetEntityHint: "Cliente", aiReady: true },
  { businessTypeId: "fornecedor", label: "Fornecedor", icon: "truck", category: "comercial", targetEntityHint: "Fornecedor", aiReady: true },
  { businessTypeId: "produto", label: "Produto", icon: "package", category: "comercial", targetEntityHint: "Produto", aiReady: true },
  { businessTypeId: "funcionario", label: "Funcionário", icon: "user-check", category: "rh", targetEntityHint: "Funcionario", aiReady: true },
  { businessTypeId: "conta_bancaria", label: "Conta Bancária", icon: "landmark", category: "financeiro", targetEntityHint: "ContaBancaria", aiReady: true },
  { businessTypeId: "centro_custo", label: "Centro de Custo", icon: "pie-chart", category: "financeiro", targetEntityHint: "CentroCusto", aiReady: true },
  { businessTypeId: "fazenda", label: "Fazenda", icon: "home", category: "agro", targetEntityHint: "Fazenda", aiReady: true },
  { businessTypeId: "talhao", label: "Talhão", icon: "grid", category: "agro", targetEntityHint: "Talhao", aiReady: true },
  { businessTypeId: "piquete", label: "Piquete", icon: "fence", category: "agro", targetEntityHint: "Piquete", aiReady: true },
  { businessTypeId: "lote", label: "Lote", icon: "layers", category: "agro", targetEntityHint: "Lote", aiReady: true },
  { businessTypeId: "animal", label: "Animal", icon: "beef", category: "agro", targetEntityHint: "Animal", aiReady: true },
  { businessTypeId: "maquina", label: "Máquina", icon: "cog", category: "agro", targetEntityHint: "Maquina", aiReady: true },
  { businessTypeId: "safra", label: "Safra", icon: "sprout", category: "agro", targetEntityHint: "Safra", aiReady: true },
]);

const byId = new Map(BUSINESS_FIELD_TYPES.map((t) => [t.businessTypeId, t]));

export function getBusinessFieldType(businessTypeId) {
  return byId.get(businessTypeId) ?? null;
}

export function listBusinessFieldTypes() {
  return BUSINESS_FIELD_TYPES;
}

export function listBusinessFieldTypeCategories() {
  return [...new Set(BUSINESS_FIELD_TYPES.map((t) => t.category))];
}

export function registerBusinessFieldTypes(registryManager) {
  BUSINESS_FIELD_TYPES.forEach((bt) => {
    registryManager.register("businessFieldTypes", bt.businessTypeId, {
      ...bt,
      version: BUSINESS_FIELD_TYPE_VERSION,
    });
  });
}

export default BUSINESS_FIELD_TYPES;
