import { createMakLayoutConfigEngine } from "@/framework/mak/layoutConfig/createMakLayoutConfigEngine.js";
import { registerMakLayoutConfigEngine } from "@/framework/mak/layoutConfig/makLayoutConfigRegistry.js";
import { createMakFieldConfigEngine } from "@/framework/mak/fieldConfig/createMakFieldConfigEngine.js";
import { registerMakFieldConfigEngine } from "@/framework/mak/fieldConfig/makFieldConfigRegistry.js";
import { createMakValidationConfigEngine } from "@/framework/mak/validation/createMakValidationConfigEngine.js";
import { registerMakValidationConfigEngine } from "@/framework/mak/validation/makValidationConfigRegistry.js";
import { createMakFormulaConfigEngine } from "@/framework/mak/formula/createMakFormulaConfigEngine.js";
import { registerMakFormulaConfigEngine } from "@/framework/mak/formula/makFormulaConfigRegistry.js";
import { createMakEventConfigEngine } from "@/framework/mak/events/createMakEventConfigEngine.js";
import { registerMakEventConfigEngine } from "@/framework/mak/events/makEventConfigRegistry.js";
import { createMakActionConfigEngine } from "@/framework/mak/actions/createMakActionConfigEngine.js";
import { registerMakActionConfigEngine } from "@/framework/mak/actions/makActionConfigRegistry.js";
import { createMakWorkflowConfigEngine } from "@/framework/mak/workflow/createMakWorkflowConfigEngine.js";
import { registerMakWorkflowConfigEngine } from "@/framework/mak/workflow/makWorkflowConfigRegistry.js";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";
import { EMP_FORM_FIELD_DEFS } from "@/modules/empresas/components/formEmp.constants.js";
import { empresasSchema } from "@/modules/empresas/config/empresasSchema.js";
import { registerLegacyBootCacheEngines } from "./registerLegacyBootCacheEngines.js";
import {
  RUNTIME_BRIDGE_PILOT_MODULES,
  RUNTIME_BRIDGE_VERSION,
} from "./runtimeBridgeConstants.js";
import { buildCrbHydrationPlan } from "./crbHydrationAdapter.js";
import { loadCrbSyncForModule, loadCrbFromApi } from "./runtimeLoader.js";
import {
  emitRuntimeBridgeHydrated,
  emitRuntimeBridgeReloaded,
  getRuntimeBridgeCacheSnapshot,
  getRuntimeHydrationSource,
  invalidateRuntimeCache,
} from "./runtimeCacheManager.js";
import { validateCrbStructure } from "./runtimeValidation.js";

let bootstrapCompleted = false;
const hydratedModules = new Set();

const registerEmpresasFromCrb = (crbPayload) => {
  const plan = buildCrbHydrationPlan(crbPayload, {
    fieldDefinitions: EMP_FORM_FIELD_DEFS,
    nativeRequiredFieldNames: empresasCadastroConfig.nativeRequiredFieldNames,
  });

  registerMakLayoutConfigEngine(
    "empresas",
    createMakLayoutConfigEngine(empresasCadastroConfig, plan.layout.metadataOverrides)
  );

  registerMakFieldConfigEngine(
    "empresas",
    createMakFieldConfigEngine("empresas", {
      cadastroConfig: empresasCadastroConfig,
      fieldDefinitions: plan.field.fieldDefinitions,
    })
  );

  registerMakValidationConfigEngine(
    "empresas",
    createMakValidationConfigEngine("empresas", {
      cadastroConfig: empresasCadastroConfig,
      fieldDefinitions: plan.field.fieldDefinitions,
      schema: empresasSchema,
      nativeRequiredFieldNames: plan.validation.nativeRequiredFieldNames,
    })
  );

  registerMakFormulaConfigEngine(
    "empresas",
    createMakFormulaConfigEngine("empresas", {
      fieldDefinitions: plan.field.fieldDefinitions,
    })
  );

  registerMakEventConfigEngine(
    "empresas",
    createMakEventConfigEngine("empresas", {
      events: plan.event.events,
    })
  );

  registerMakActionConfigEngine(
    "empresas",
    createMakActionConfigEngine("empresas", {
      actionDefinitions: plan.action.actions.map((actionId) => ({ id: actionId, actionId })),
    })
  );

  registerMakWorkflowConfigEngine(
    "empresas",
    createMakWorkflowConfigEngine("empresas", {
      workflowDefinitions: plan.workflow.workflows,
    })
  );

  hydratedModules.add("empresas");
  emitRuntimeBridgeHydrated("empresas", {
    source: getRuntimeHydrationSource("empresas"),
    versionId: plan.versionId,
    registryEntryIds: plan.registryEntryIds,
  });

  return plan;
};

/**
 * Sole runtime hydration entry point — Program 1E Phase 1.
 * CRB when available; legacy boot cache fallback otherwise.
 */
export function bootstrapRuntimeBridge() {
  if (bootstrapCompleted) return getRuntimeBridgeStatus();

  registerLegacyBootCacheEngines({ skipModules: [...RUNTIME_BRIDGE_PILOT_MODULES] });

  for (const moduleId of RUNTIME_BRIDGE_PILOT_MODULES) {
    const envelope = loadCrbSyncForModule(moduleId);
    if (envelope?.payload) {
      const validation = validateCrbStructure(envelope.payload, { moduleId });
      if (validation.valid) {
        if (moduleId === "empresas") {
          registerEmpresasFromCrb(envelope.payload);
          continue;
        }
      }
    }

    registerLegacyBootCacheEngines({ onlyModules: [moduleId] });
  }

  bootstrapCompleted = true;
  return getRuntimeBridgeStatus();
}

/**
 * Deploy activation hook — reload pinned CRB after publish.
 * @param {string} moduleId
 * @param {object} [options]
 */
export async function reloadRuntimeBridgeModule(moduleId, options = {}) {
  if (!RUNTIME_BRIDGE_PILOT_MODULES.includes(moduleId)) {
    throw new Error(`Runtime Bridge reload não suportado para módulo ${moduleId}.`);
  }

  invalidateRuntimeCache(moduleId);
  const envelope = await loadCrbFromApi(moduleId, options);

  if (moduleId === "empresas") {
    registerEmpresasFromCrb(envelope.payload);
  }

  emitRuntimeBridgeReloaded(moduleId, {
    source: "api",
    versionId: envelope.versionId,
  });

  return getRuntimeBridgeStatus();
}

export function getRuntimeBridgeStatus() {
  return Object.freeze({
    version: RUNTIME_BRIDGE_VERSION,
    bootstrapCompleted,
    pilotModules: RUNTIME_BRIDGE_PILOT_MODULES,
    hydratedModules: [...hydratedModules],
    cache: getRuntimeBridgeCacheSnapshot(),
  });
}

export function isRuntimeBridgeHydrated(moduleId) {
  return hydratedModules.has(moduleId);
}

export default bootstrapRuntimeBridge;
