import { RuntimeBootstrapError } from './errors.js';
import { runRt0Shell } from './phases/rt0-shell.js';

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
 * @param {import('../../types/context.js').RuntimeInstance} instance
 * @param {import('../../types/context.js').CrbReference} _crbRef
 */
export async function hydrate(instance, _crbRef) {
  if (instance.status === 'destroyed') {
    throw new RuntimeBootstrapError('MAK-L3-RUNTIME-001', 'Runtime instance destroyed');
  }
  throw new RuntimeBootstrapError(
    'MAK-L3-RUNTIME-003',
    'hydrate() not available until Foundation C.3 (CRB Loader)',
  );
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
