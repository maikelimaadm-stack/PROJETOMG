import { ContextError } from './errors.js';

/**
 * Immutable runtime context (M02).
 * @implements {import('../../types/context.js').IRuntimeContext}
 */
export class RuntimeContext {
  /**
   * @param {Object} params
   * @param {string} params.tenantId
   * @param {string} params.userId
   * @param {string} params.traceId
   * @param {string} params.locale
   * @param {import('../../types/uec.js').AccessScope} params.accessScope
   * @param {string} [params.selectedCompanyId]
   */
  constructor({ tenantId, userId, traceId, locale, accessScope, selectedCompanyId }) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.traceId = traceId;
    this.locale = locale;
    this.accessScope = Object.freeze({ ...accessScope });
    this.selectedCompanyId = selectedCompanyId;

    Object.freeze(this);
  }

  /**
   * @param {import('../../types/uec.js').ContextScope} scope
   * @returns {RuntimeContext}
   */
  child(scope = {}) {
    const nextTenantId = scope.tenantId ?? this.tenantId;
    const nextUserId = scope.userId ?? this.userId;

    if (this.tenantId && nextTenantId && this.tenantId !== nextTenantId) {
      throw new ContextError(
        'MAK-L2-CONTEXT-001',
        `Cross-tenant context forbidden: ${this.tenantId} → ${nextTenantId}`,
      );
    }

    if (scope.accessScope?.tenantId && this.tenantId && scope.accessScope.tenantId !== this.tenantId) {
      throw new ContextError(
        'MAK-L2-CONTEXT-001',
        `Cross-tenant accessScope forbidden: ${this.tenantId} → ${scope.accessScope.tenantId}`,
      );
    }

    const accessScope = scope.accessScope
      ? { ...this.accessScope, ...scope.accessScope }
      : { ...this.accessScope, tenantId: nextTenantId, userId: nextUserId };

    return new RuntimeContext({
      tenantId: nextTenantId,
      userId: nextUserId,
      traceId: scope.traceId ?? this.traceId,
      locale: scope.locale ?? this.locale,
      accessScope,
      selectedCompanyId: scope.selectedCompanyId ?? this.selectedCompanyId,
    });
  }
}
