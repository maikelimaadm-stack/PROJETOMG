/**
 * MVP home content — explainable placeholders until Intelligence engines ship.
 * All items use business vocabulary (D-074 P-04).
 */

/** @returns {import('./bosTypes.js').BosObjective[]} */
export function buildDefaultObjectives() {
  return [
    {
      id: "obj-growth",
      title: "Expandir base de clientes",
      status: "active",
      progress: 62,
      hint: "Acompanhe novos cadastros e reativações.",
    },
    {
      id: "obj-quality",
      title: "Melhorar qualidade dos dados",
      status: "active",
      progress: 48,
      hint: "Campos obrigatórios e consistência entre empresas.",
    },
    {
      id: "obj-efficiency",
      title: "Reduzir trabalho manual",
      status: "planned",
      progress: 15,
      hint: "Automações e campos calculados liberam tempo.",
    },
  ];
}

/** @returns {import('./bosTypes.js').BosRecommendation[]} */
export function buildExplainableSuggestions() {
  return [
    {
      id: "rec-workflow-compras",
      title: "Configurar aprovação de compras",
      explanation:
        "Descreva quem aprova, prazos e retornos — o sistema deriva o Workflow como ativo de negócio.",
      actionLabel: "Criar fluxo",
      actionRoute: "/bos/business-first?asset=workflow",
      confidence: "alta",
    },
    {
      title: "Criar campo calculado para impostos",
      explanation:
        "Você descreve a regra em linguagem de negócio; o sistema traduz para execução sem expor fórmulas.",
      actionLabel: "Criar por intenção",
      actionRoute: "/bos/business-first?asset=computed_field",
      confidence: "alta",
    },
    {
      id: "rec-review-empresas",
      title: "Revisar cadastros de empresas incompletos",
      explanation:
        "Operação Clientes e Empresas tem registros que podem estar sem dados essenciais.",
      actionLabel: "Abrir operação",
      actionRoute: "/CadastroEmpresas",
      confidence: "média",
    },
    {
      id: "rec-health-data",
      title: "Ativar monitoramento de saúde dos dados",
      explanation:
        "Business Health acompanhará indicadores quando a camada de memória estiver ativa.",
      actionLabel: "Ver saúde",
      actionRoute: "/bos#health",
      confidence: "informativa",
    },
  ];
}

/** @returns {import('./bosTypes.js').BosActivityItem[]} */
export function buildRecentActivity() {
  return [
    {
      id: "act-1",
      label: "Cadastro de empresas acessado",
      context: "Operação · Clientes e Empresas",
      when: "Hoje",
    },
    {
      id: "act-2",
      label: "Preferências de visualização sincronizadas",
      context: "Operação · Personalização",
      when: "Hoje",
    },
    {
      id: "act-3",
      label: "Memória empresarial em preparação",
      context: "Enterprise Memory · teaser",
      when: "Em breve",
    },
  ];
}

/** @returns {import('./bosTypes.js').BosHealthSummary} */
export function buildHealthSummary() {
  return {
    score: 78,
    trend: "stable",
    label: "Saúde operacional",
    highlights: [
      { id: "h1", label: "Cadastros ativos", value: "Estável", tone: "good" },
      { id: "h2", label: "Dados incompletos", value: "Atenção", tone: "warn" },
      { id: "h3", label: "Automações", value: "Não configuradas", tone: "neutral" },
    ],
  };
}

export default {
  buildDefaultObjectives,
  buildExplainableSuggestions,
  buildRecentActivity,
  buildHealthSummary,
};
