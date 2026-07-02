/**
 * Minimal empty service locator stub for RT-0 (M20 partial — completed in C.5).
 */
export function createEmptyServiceLocator() {
  /** @type {Map<string, unknown>} */
  const singletons = new Map();

  return Object.freeze({
    register(token, factory, _scope = 'singleton') {
      if (singletons.has(token)) {
        throw new Error(`Service already registered: ${token}`);
      }
      singletons.set(token, factory);
    },
    resolve(token) {
      const factory = singletons.get(token);
      if (!factory) {
        throw new Error(`Service not registered: ${token}`);
      }
      return typeof factory === 'function' ? factory() : factory;
    },
    createScope() {
      return createEmptyServiceLocator();
    },
    clear() {
      singletons.clear();
    },
  });
}
