/**
 * BOS primary navigation — capability-centric (VA-04, D-074).
 */
export const BOS_PRIMARY_NAV = Object.freeze([
  { id: "home", label: "Início", route: "/" },
  { id: "objectives", label: "Objetivos", route: "/#objectives" },
  { id: "capabilities", label: "Capacidades", route: "/#capabilities" },
  { id: "assets", label: "Ativos", route: "/#assets" },
  { id: "operations", label: "Operações", route: "/#operations" },
  { id: "health", label: "Saúde", route: "/#health" },
]);

export const BOS_AUTHORING_ENTRIES = Object.freeze([
  {
    id: "business-first",
    label: "Criar por intenção",
    description: "Business First — descreva o que precisa em linguagem de negócio.",
    route: "/bos/business-first",
    mode: "default",
  },
  {
    id: "expert-mode",
    label: "Modo especialista",
    description: "Exceção controlada — vocabulário de negócio avançado, sem ferramentas técnicas.",
    route: "/bos/expert",
    mode: "expert",
  },
]);

export default BOS_PRIMARY_NAV;
