import { RuntimeBootstrapError } from './errors.js';
import { runRt0Shell } from './phases/rt0-shell.js';
import { loadRuntimeBundle } from './loadRuntimeBundle.js';
import { createLoader } from '../loader/loaderManager.js';
import { createCrbLoader } from '../crb/crbLoader.js';

/**
 * @param {import('../../types/context.js').BootstrapConfig} config
 * @returns {Promise<import('../../types/context.js').RuntimeInstance>}
 */
export async function bootstrap(config) {
  if (!config?.host || !config?.applicationId || !config?.environment || !config?.apiBaseUrl) {
    throw new RuntimeBootstrapError(
      'MAK-L3-RUNTIME-001',
      'Bootstrap config incomplete — maintenance mode',
    );
  }

  return runRt0Shell(config);
}

/**
 * RT-1 → RT-3 — verify CRB and hydrate registries (Foundation C.3).
 * @param {import('../../types/context.js').RuntimeInstance} instance
 * @param {import('../../types/context.js').CrbReference} crbRef
 * @returns {Promise<import('../../types/context.js').HydratedRuntime>}
 */
export async function hydrate(instance, crbRef) {
  if (instance.status === 'destroyed') {
    throw new RuntimeBootstrapError('MAK-L3-RUNTIME-001', 'Runtime instance destroyed');
  }
  if (!crbRef?.bundleId || !crbRef?.definitionVersionId) {
    throw new RuntimeBootstrapError('MAK-L3-RUNTIME-001', 'CRB reference incomplete');
  }
  if (!crbRef.payload) {
    throw new RuntimeBootstrapError('MAK-L3-RUNTIME-002', 'CRB payload required for hydrate');
  }

  return hydrateWithBundle(instance, buildPin(instance, crbRef), crbRef.payload);
}

/**
 * @param {import('../../types/context.js').RuntimeInstance} instance
 * @param {import('../../types/crb.js').EnvironmentPin} pin
 * @param {import('../../types/crb.js').CrbPayload} crbPayload
 * @returns {Promise<import('../../types/context.js').HydratedRuntime>}
 */
export async function hydrateWithBundle(instance, pin, crbPayload) {
  const loader = createLoader();
  loader.registerBundle(pin.bundleId, crbPayload);

  try {
    const result = await loadRuntimeBundle({
      context: instance.context,
      pin,
      loader,
      registry: instance.registry ?? undefined,
      crbLoader: createCrbLoader(instance.config.environment),
    });

    instance.registry = result.registry;
    instance.bundle = result.bundle;
    instance.phase = 'RT-3';
    instance.status = 'hydrated';

    // M20 — post RT-3, wire the services materialized by the CRB pipeline (M05, M06, M07, M08).
    if (instance._serviceLocator) {
      instance._serviceLocator.register('registry', result.registry, { override: true });
      instance._serviceLocator.register('loader', result.loader, { override: true });
      instance._serviceLocator.register('crbLoader', result.crbLoader, { override: true });
      instance._serviceLocator.register('dependencyResolver', result.dependencyResolver, { override: true });
      instance._serviceLocator.register('router', result.router, { override: true });
      instance._serviceLocator.register('permissionEngine', result.permissionEngine, { override: true });
      instance._serviceLocator.register('actionEngine', result.actionEngine, { override: true });
      instance._serviceLocator.register('workflowEngine', result.workflowEngine, { override: true });
      instance._serviceLocator.register('renderEngine', result.renderEngine, { override: true });
      instance._serviceLocator.register('expressionEngine', result.expressionEngine, { override: true });
      instance._serviceLocator.register('formulaEngine', result.formulaEngine, { override: true });
      instance._serviceLocator.register('validationEngine', result.validationEngine, { override: true });
    }

    return {
      instance,
      bundle: result.bundle,
      registry: result.registry,
    };
  } catch (err) {
    if (err instanceof RuntimeBootstrapError) throw err;
    const code = err?.code === 'MAK-L3-RUNTIME-003' ? 'MAK-L3-RUNTIME-003' : 'MAK-L3-RUNTIME-002';
    throw new RuntimeBootstrapError(code, err instanceof Error ? err.message : 'CRB hydrate failed');
  }
}

/**
 * @param {import('../../types/context.js').RuntimeInstance} instance
 * @param {import('../../types/context.js').CrbReference} crbRef
 */
function buildPin(instance, crbRef) {
  return {
    tenantId: instance.context.tenantId || instance.config.tenantId,
    applicationId: instance.config.applicationId,
    environment: instance.config.environment,
    bundleId: crbRef.bundleId,
    definitionVersionId: crbRef.definitionVersionId,
    moduleId: crbRef.moduleId,
  };
}

/**
 * @param {import('../../types/context.js').RuntimeInstance} instance
 */
export async function destroy(instance) {
  if (!instance || typeof instance.destroy !== 'function') {
    throw new RuntimeBootstrapError('MAK-L3-RUNTIME-001', 'Invalid runtime instance');
  }
  await instance.destroy();
}

export { RuntimeBootstrapError };
