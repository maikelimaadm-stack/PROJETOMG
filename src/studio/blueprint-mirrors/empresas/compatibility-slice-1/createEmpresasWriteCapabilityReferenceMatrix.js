import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { compatDigest } from './empresasStudioCompatibilitySlice1Config.js';

/**
 * Reference matrix for Empresas capabilities. `read` is certified. All writes are
 * reference-only / future-controlled. No permission is changed, no endpoint is called,
 * mutation is never allowed, delete never starts enabled.
 */
const CAPABILITIES = [
  { capability: 'read', currentStatus: 'certified', mirrorStatus: 'existing', allowedInThisSlice: true, requiresFutureSlice: false },
  { capability: 'create', currentStatus: 'reference_only', mirrorStatus: 'reference_only', allowedInThisSlice: false, requiresFutureSlice: true },
  { capability: 'update', currentStatus: 'reference_only', mirrorStatus: 'reference_only', allowedInThisSlice: false, requiresFutureSlice: true },
  { capability: 'delete', currentStatus: 'reference_only', mirrorStatus: 'reference_only', allowedInThisSlice: false, requiresFutureSlice: true },
  { capability: 'export', currentStatus: 'inferred', mirrorStatus: 'inferred', allowedInThisSlice: false, requiresFutureSlice: true },
  { capability: 'configure', currentStatus: 'needs_alignment', mirrorStatus: 'needs_alignment', allowedInThisSlice: false, requiresFutureSlice: true },
  { capability: 'diagnostics', currentStatus: 'inferred', mirrorStatus: 'inferred', allowedInThisSlice: false, requiresFutureSlice: true },
];

/**
 * Builds the write capability reference matrix. Pure, contract-only.
 *
 * @param {Object} [options]
 * @returns {Object} write capability reference matrix
 */
export function createEmpresasWriteCapabilityReferenceMatrix(options = {}) {
  void options;
  const capabilities = CAPABILITIES.map((c) => ({
    capability: c.capability,
    currentStatus: c.currentStatus,
    mirrorStatus: c.mirrorStatus,
    permissionRequirement: 'defaultDeny/failClosed',
    tenantRequirement: 'tenant-scoped',
    persistenceRequirement: c.capability === 'read' ? 'read-only' : 'no-write-this-slice',
    runtimeRequirement: 'referenceOnly',
    safeDefault: c.capability === 'delete' ? 'blocked' : (c.capability === 'read' ? 'read-only' : 'blocked'),
    allowedInThisSlice: c.allowedInThisSlice,
    requiresFutureSlice: c.requiresFutureSlice,
    risk: (c.capability === 'delete' || c.capability === 'update' || c.capability === 'create') ? 'dangerous_if_default_open' : 'low',
    notes: 'no permission altered; no endpoint called; mutation never allowed',
  }));

  const body = {
    kind: 'empresas-write-capability-reference-matrix',
    capabilities,
    capabilityCount: capabilities.length,
    readCertified: capabilities.find((c) => c.capability === 'read').currentStatus === 'certified',
    mutationAllowed: false,
    productionWrite: false,
    deleteEnabledByDefault: false,
    permissionsAltered: false,
    endpointCalled: false,
    writesAllowedThisSlice: capabilities.filter((c) => c.capability !== 'read').every((c) => c.allowedInThisSlice === false),
    alignmentStatus: 'referenceOnly',
  };
  return safeCloneGenericModel({ ...body, writeCapabilityDigest: compatDigest({ capabilities: capabilities.map((c) => [c.capability, c.currentStatus, c.allowedInThisSlice]) }) });
}

export default createEmpresasWriteCapabilityReferenceMatrix;
