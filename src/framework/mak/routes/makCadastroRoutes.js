import generatedModules from "@/modules/generatedModules.json";

const MAK_CADASTRO_ROUTE_PREFIXES = generatedModules
  .map((moduleConfig) => String(moduleConfig.routePath || "").trim())
  .filter(Boolean);

/** Rotas cadastro MAK conhecidas — home BOS (`/`) não é cadastro. */
export const MAK_CADASTRO_ROUTES = [...MAK_CADASTRO_ROUTE_PREFIXES];

/**
 * Indica se o pathname pertence a uma tela cadastro MAK (chrome MG).
 * @param {string} pathname
 */
export function isMakCadastroRoute(pathname) {
  const normalized = String(pathname || "").trim();
  if (!normalized || normalized === "/") return false;
  return MAK_CADASTRO_ROUTE_PREFIXES.some(
    (routePath) => normalized === routePath || normalized.startsWith(`${routePath}/`)
  );
}
