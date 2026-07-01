import { TEMPLATE_LIBRARY_VERSION, TEMPLATE_LIFECYCLE_STATES } from "./segmentationEngineContracts.js";

/** Business-owned template catalog — reusable operational paths */
export const TEMPLATE_CATALOG = Object.freeze([
  Object.freeze({
    templateId: "tmpl-operational-excellence",
    label: "Excelência operacional",
    summary: "Consolidar processos, decisões e conhecimento em operação madura.",
    targetSegments: ["segment.operational_mature", "segment.improvement_driven"],
    priorityCapabilities: ["Operações", "Conhecimento", "Decisões"],
    expectedImpact: "Estabilidade e previsibilidade operacional.",
    lifecycleState: TEMPLATE_LIFECYCLE_STATES[1],
  }),
  Object.freeze({
    templateId: "tmpl-decision-structure",
    label: "Estrutura de decisões",
    summary: "Formalizar decisões recorrentes com evidência e alternativas.",
    targetSegments: ["segment.structure_building", "segment.emerging_operation"],
    priorityCapabilities: ["Decisões", "Consultoria interna"],
    expectedImpact: "Decisões mais rápidas e explicáveis.",
    lifecycleState: TEMPLATE_LIFECYCLE_STATES[1],
  }),
  Object.freeze({
    templateId: "tmpl-knowledge-foundation",
    label: "Fundação de conhecimento",
    summary: "Conectar memória, ativos e relações em grafo organizacional.",
    targetSegments: ["segment.emerging_operation", "segment.structure_building"],
    priorityCapabilities: ["Conhecimento", "Operações"],
    expectedImpact: "Contexto operacional reutilizável.",
    lifecycleState: TEMPLATE_LIFECYCLE_STATES[1],
  }),
  Object.freeze({
    templateId: "tmpl-evolution-acceleration",
    label: "Aceleração de evolução",
    summary: "Priorizar capacidades com maior gap e planos de melhoria.",
    targetSegments: ["segment.growth_focused", "segment.improvement_driven"],
    priorityCapabilities: ["Evolução contínua", "Consultoria interna"],
    expectedImpact: "Progresso mensurável na maturidade.",
    lifecycleState: TEMPLATE_LIFECYCLE_STATES[1],
  }),
  Object.freeze({
    templateId: "tmpl-maturity-roadmap",
    label: "Roteiro de maturidade",
    summary: "Sequência de marcos por domínio de capacidade.",
    targetSegments: [
      "segment.emerging_operation",
      "segment.structure_building",
      "segment.growth_focused",
    ],
    priorityCapabilities: ["Evolução contínua", "Operações", "Decisões"],
    expectedImpact: "Visão clara de evolução por capacidade.",
    lifecycleState: TEMPLATE_LIFECYCLE_STATES[1],
  }),
]);

export function getTemplateCatalog() {
  return TEMPLATE_CATALOG;
}

export function getTemplateLibraryInfo() {
  return Object.freeze({
    version: TEMPLATE_LIBRARY_VERSION,
    templateCount: TEMPLATE_CATALOG.length,
    belongsToEnterprise: true,
    belongsToStudio: false,
    belongsToScreen: false,
  });
}

export default { getTemplateCatalog, getTemplateLibraryInfo, TEMPLATE_CATALOG };
