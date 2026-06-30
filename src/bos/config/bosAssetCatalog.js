/**
 * Business Asset registry — MVP surface (Program 3.9).
 * Certified assets appear as live; extension points as teasers per G306.
 */
export const BOS_ASSET_TYPES = Object.freeze({
  COMPUTED_FIELD: "business.asset.computed_field",
  WORKFLOW: "business.asset.workflow",
  DASHBOARD: "business.asset.dashboard",
  AUTOMATION: "business.asset.automation",
  INTEGRATION: "business.asset.integration",
});

/**
 * @returns {import('./bosTypes.js').BosAssetType[]}
 */
export function buildBosAssetTypes() {
  return [
    {
      assetType: BOS_ASSET_TYPES.COMPUTED_FIELD,
      label: "Campo Calculado",
      description: "Regra de negócio que calcula valores automaticamente.",
      status: "available",
      createRoute: "/bos/business-first?asset=computed_field",
      icon: "calculator",
    },
    {
      assetType: BOS_ASSET_TYPES.WORKFLOW,
      label: "Fluxo de Aprovação",
      description: "Processos e aprovações em linguagem de negócio.",
      status: "coming_soon",
      createRoute: null,
      icon: "git-branch",
    },
    {
      assetType: BOS_ASSET_TYPES.DASHBOARD,
      label: "Indicador / Painel",
      description: "KPIs e visões de desempenho do negócio.",
      status: "coming_soon",
      createRoute: null,
      icon: "bar-chart",
    },
    {
      assetType: BOS_ASSET_TYPES.AUTOMATION,
      label: "Automação",
      description: "Regras automáticas com aprovação humana.",
      status: "coming_soon",
      createRoute: null,
      icon: "zap",
    },
    {
      assetType: BOS_ASSET_TYPES.INTEGRATION,
      label: "Integração",
      description: "Conectores declarados como ativos de negócio.",
      status: "coming_soon",
      createRoute: null,
      icon: "link",
    },
  ];
}

export default buildBosAssetTypes;
