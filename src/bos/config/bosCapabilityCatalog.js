/**
 * User-facing capability catalog — BOS navigation SSOT (Program 3.9, D-074).
 * Maps business capabilities to Runtime operation routes (not module identity).
 */
import generatedModules from "@/modules/generatedModules.json";

const CAPABILITY_OVERRIDES = {
  empresas: {
    capabilityId: "capability.clientes_empresas",
    label: "Clientes e Empresas",
    description: "Gerencie cadastro, relacionamento e dados das empresas do seu negócio.",
    icon: "building",
    category: "operations",
    audience: "business",
  },
  cadcps: {
    capabilityId: "capability.campos_negocio",
    label: "Campos de Negócio",
    description: "Defina atributos personalizados como ativos reutilizáveis do negócio.",
    icon: "sliders",
    category: "assets",
    audience: "expert",
  },
};

const ICON_BY_MODULE = {
  empresas: "building",
  cadcps: "sliders",
};

/**
 * @returns {import('./bosTypes.js').BosCapability[]}
 */
export function buildBosCapabilities() {
  return generatedModules.map((module) => {
    const override = CAPABILITY_OVERRIDES[module.moduleId] ?? {};
    return {
      capabilityId: override.capabilityId ?? `capability.${module.moduleId}`,
      moduleId: module.moduleId,
      label: override.label ?? module.menuLabel ?? module.moduleId,
      description:
        override.description ??
        `Operação de negócio vinculada ao cadastro ${module.menuLabel ?? module.moduleId}.`,
      operationRoute: module.routePath,
      icon: override.icon ?? ICON_BY_MODULE[module.moduleId] ?? "layers",
      category: override.category ?? "operations",
      audience: override.audience ?? "business",
      enabled: true,
    };
  });
}

/** @returns {import('./bosTypes.js').BosCapability | null} */
export function findCapabilityByRoute(routePath) {
  return buildBosCapabilities().find((cap) => cap.operationRoute === routePath) ?? null;
}

export default buildBosCapabilities;
