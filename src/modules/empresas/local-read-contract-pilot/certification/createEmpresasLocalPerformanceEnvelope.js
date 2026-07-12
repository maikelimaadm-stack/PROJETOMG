import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { createEmpresasReadPerformanceBaseline } from '../hardening/createEmpresasReadPerformanceBaseline.js';

/**
 * The certified LOCAL performance envelope (NOT a production SLA). Consolidates the
 * hardening baseline across profiles with hardware-independent certification rules.
 *
 * @param {Object} [options]
 * @param {() => number} [options.clock]
 * @returns {Object} performance envelope descriptor
 */
export function createEmpresasLocalPerformanceEnvelope(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  let t = 0;
  const baseline = createEmpresasReadPerformanceBaseline({ iterations: 2, clock: o.clock || (() => (t += 1)) });
  const profiles = [...new Set(baseline.measurements.map((m) => m.datasetProfile))];
  const largest = baseline.measurements.reduce((mx, m) => Math.max(mx, m.datasetSize), 0);

  const hardwareIndependentRules = [
    'every operation completes (finite timings)',
    'no explosive growth incompatible with O(n)/O(n log n)',
    'no timeout',
    'no network / backend / Prisma usage',
    'no mutation',
    'large capped at 2000 records',
    'no hard millisecond SLA per hardware',
  ];

  const body = {
    kind: 'empresas-local-performance-envelope',
    isSla: false,
    datasetProfiles: profiles,
    largestDataset: largest,
    operations: [...new Set(baseline.measurements.map((m) => m.operation))],
    sampleCount: baseline.measurements.length,
    complexityClassification: { filterSortPage: 'O(n)/O(n log n)', digest: 'O(n)', projection: 'O(n)' },
    hardwareIndependentRules,
    anomalyPolicy: 'critical anomaly invalidates certification',
    hasAnomaly: baseline.hasAnomaly === true,
    certificationStatus: baseline.hasAnomaly ? 'blocked' : 'certified',
  };
  return safeCloneGenericModel({ ...body, performanceEnvelopeDigest: createGenericModelChecksum({ value: { profiles, largest, operations: body.operations, hasAnomaly: body.hasAnomaly } }) });
}

export default createEmpresasLocalPerformanceEnvelope;
