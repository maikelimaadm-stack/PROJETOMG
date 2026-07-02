import { randomUUID } from 'node:crypto';
import { RuntimeContext } from './RuntimeContext.js';

/**
 * @param {import('../../types/uec.js').ContextScope} [scope]
 * @returns {RuntimeContext}
 */
export function createEmptyAccessScope() {
  return Object.freeze({
    tenantId: '',
    userId: '',
    companies: [],
    permissions: [],
    locale: 'pt-BR',
  });
}

/**
 * @param {import('../../types/uec.js').ContextScope} [scope]
 * @returns {RuntimeContext}
 */
export function createContext(scope = {}) {
  const tenantId = scope.tenantId ?? '';
  const userId = scope.userId ?? '';
  const traceId = scope.traceId ?? randomUUID();
  const locale = scope.locale ?? 'pt-BR';
  const accessScope = scope.accessScope
    ? { ...createEmptyAccessScope(), ...scope.accessScope }
    : { ...createEmptyAccessScope(), tenantId, userId, locale };

  return new RuntimeContext({
    tenantId,
    userId,
    traceId,
    locale,
    accessScope,
    selectedCompanyId: scope.selectedCompanyId,
  });
}
