import { CRB_REGISTRY_MAP } from './crbConstants.js';
import { BundleLifecycle } from './BundleLifecycle.js';
import { CrbError } from './errors.js';

/**
 * Maps CRB registries → Universal Registry (V13–V20).
 * @param {import('../../types/crb.js').CrbPayload} crb
 * @param {import('../registry/registryManager.js').RegistryManager} registry
 */
export function hydrateRegistries(crb, registry) {
  const rollback = BundleLifecycle.createRollbackTracker();
  const registryTypes = new Set();
  let entriesRegistered = 0;
  const started = performance.now();

  try {
    for (const [bucket, entriesByModule] of Object.entries(crb.registries ?? {})) {
      const registryType = CRB_REGISTRY_MAP[bucket];
      if (!registryType) continue;

      for (const [moduleId, entries] of Object.entries(entriesByModule)) {
        entries.forEach((entry, index) => {
          const record = /** @type {{code?: string, objectId?: string, objectType?: string}} */ (entry);
          const key = record.code ?? record.objectId ?? `${moduleId}-${index}`;
          registry.register(registryType, key, () => Object.freeze({ ...record, moduleId }));
          rollback.track(registryType, key);
          registryTypes.add(registryType);
          entriesRegistered += 1;
        });
      }
    }

    for (const route of crb.route ?? []) {
      const key = route.path ?? route.objectId;
      registry.register('route', key, () => Object.freeze({ ...route }));
      rollback.track('route', key);
      registryTypes.add('route');
      entriesRegistered += 1;
    }

    for (const obj of crb.objects ?? []) {
      const objectType = /** @type {{objectType?: string, objectId?: string, payload?: {code?: string}}} */ (obj);
      if (objectType.objectType === 'entity' || objectType.objectType === 'business_object') {
        const key = objectType.payload?.code ?? objectType.objectId;
        registry.register('entity', key, () => Object.freeze({ ...obj }));
        rollback.track('entity', key);
        registryTypes.add('entity');
        entriesRegistered += 1;
      }
      if (objectType.objectType === 'integration') {
        registry.register('connector', objectType.objectId, () => Object.freeze({ ...obj }));
        rollback.track('connector', objectType.objectId);
        registryTypes.add('connector');
        entriesRegistered += 1;
      }
      if (objectType.objectType === 'plugin') {
        registry.register('plugin', objectType.objectId, () => Object.freeze({ ...obj }));
        rollback.track('plugin', objectType.objectId);
        registryTypes.add('plugin');
        entriesRegistered += 1;
      }
      if (objectType.objectType === 'view') {
        registry.register('renderer', objectType.objectId, () => Object.freeze({ ...obj }));
        rollback.track('renderer', objectType.objectId);
        registryTypes.add('renderer');
        entriesRegistered += 1;
      }
    }

    rollback.clear();
    return {
      success: true,
      entriesRegistered,
      registryTypes: [...registryTypes],
      hydrationMs: performance.now() - started,
    };
  } catch (err) {
    rollback.rollback(registry);
    throw err instanceof CrbError
      ? err
      : new CrbError('MAK-L3-RUNTIME-004', err instanceof Error ? err.message : 'Hydration failed');
  }
}
