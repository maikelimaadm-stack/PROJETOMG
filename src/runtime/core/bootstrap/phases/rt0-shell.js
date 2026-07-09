import { createContext } from '../../context/createContext.js';
import { createServiceLocator } from '../../../infra/service-locator/serviceLocator.js';
import { createRegistry } from '../../registry/registryManager.js';
import { startSpan } from '../../../infra/observability/tracer.js';

/**
 * RT-0 Bootstrap Shell — Foundation C.1 partial scope + M20 Service Locator wiring (C.5).
 * @param {import('../../types/context.js').BootstrapConfig} config
 * @returns {Promise<import('../../types/context.js').RuntimeInstance>}
 */
export async function runRt0Shell(config) {
  const serviceLocator = createServiceLocator();

  const context = createContext({
    tenantId: config.tenantId ?? '',
    traceId: undefined,
    locale: 'pt-BR',
    accessScope: {
      tenantId: config.tenantId ?? '',
      userId: '',
      companies: [],
      permissions: [],
      locale: 'pt-BR',
    },
  });

  const span = startSpan('runtime.bootstrap', { traceId: context.traceId });
  span.end();

  const registry = createRegistry();

  // M20 — core services known at RT-0 are resolvable immediately (M02 Context, M04 Registry).
  serviceLocator.register('context', context);
  serviceLocator.register('registry', registry);

  /** @type {import('../../types/context.js').RuntimeInstance} */
  const instance = {
    context,
    config,
    phase: 'RT-0',
    status: 'shell-ready',
    accessScope: context.accessScope,
    registry,
    bundle: null,
    /** @type {ReturnType<typeof createServiceLocator>} */
    _serviceLocator: serviceLocator,
    /** @type {typeof span | null} */
    _rootSpan: span,
    async destroy() {
      if (instance.status === 'destroyed') return;
      serviceLocator.clear();
      instance.status = 'destroyed';
    },
  };

  Object.defineProperty(instance, '_serviceLocator', { enumerable: false });
  Object.defineProperty(instance, '_rootSpan', { enumerable: false });

  return instance;
}
