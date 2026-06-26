/** Escopo CSS visual promovido do Cadastro de Empresas — aplicar em todos os ModeloBase1. */
export const MODELO_BASE1_MASTER_VISUAL_SCOPE = "cadastro-emp-scope mg-empresas-scope";

/** Monta scope por módulo mantendo paridade visual com Empresas. */
export function buildModeloBase1ScopeCssClass(moduleId) {
  const moduleScope = moduleId ? `cadastro-${moduleId}-scope` : "";
  return [moduleScope, MODELO_BASE1_MASTER_VISUAL_SCOPE].filter(Boolean).join(" ");
}

export default buildModeloBase1ScopeCssClass;
