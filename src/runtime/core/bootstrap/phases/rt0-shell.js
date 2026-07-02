import { createContext } from '../../context/createContext.js';
import { createEmptyServiceLocator } from '../../../infra/service-locator/serviceLocator.js';
import { startSpan } from '../../../infra/observability/tracer.js';

/**
 * RT-0 Bootstrap Shell — Foundation C.1 partial scope.
 * @param {import('../../types/context.js').BootstrapConfig} config
 * @returns {Promise<import('../../types/context.js').RuntimeInstance>}
 */
export async function runRt0Shell(config) {
  const serviceLocator = createEmptyServiceLocator();

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

  /** @type {import('../../types/context.js').RuntimeInstance} */
  const instance = {
    context,
    phase: 'RT-0',
    status: 'shell-ready',
    accessScope: context.accessScope,
    /** @type {ReturnType<typeof createEmptyServiceLocator>} */
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
