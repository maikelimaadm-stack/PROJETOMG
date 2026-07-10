import { isPlainObject, safeClone } from '../../../shadow/pilots/tableFormProjection.js';
import { validateDatasetShape, datasetError } from './controlledDevDataset.js';
import { createEmpresasControlledDataset } from './createEmpresasControlledDataset.js';
import { createCadcpsControlledDataset } from './createCadcpsControlledDataset.js';
import { isControlledDevDatasetEnabled } from './controlledDatasetConfig.js';

/**
 * Controlled dev dataset orchestrator. Aggregates the per-module datasets
 * (Empresas + cadcps) behind an opt-in, dev-only, disable-safe API. When
 * disabled it exposes an empty, safe surface (no modules/records). Every getter
 * returns a deep-cloned copy so mutating a result never affects internal state.
 * Never real data, never backend/Prisma, never side effects.
 */
export class ControlledDevDataset {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.enabled] Explicit opt-in; when omitted, reads the dataset flag from env.
   * @param {Record<string, unknown>} [options.env]
   */
  constructor(options = {}) {
    if (!isPlainObject(options)) {
      throw datasetError('MAK-L3-DEV-DATASET-002', 'ControlledDevDataset options must be a plain object');
    }
    validateDatasetShape(options, 0, 'ControlledDevDataset options'); // blocks prototype pollution
    const { enabled, env } = options;
    this._enabled = enabled === undefined ? isControlledDevDatasetEnabled(env) : Boolean(enabled);
    /** @type {Map<string, import('../../../types/controlled-dev-dataset.js').ControlledModuleDataset>} */
    this._modules = new Map();
    if (this._enabled) {
      const empresas = createEmpresasControlledDataset();
      const cadcps = createCadcpsControlledDataset();
      this._modules.set(empresas.moduleId, empresas);
      this._modules.set(cadcps.moduleId, cadcps);
    }
    this._reads = 0;
  }

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /** @returns {string[]} Module ids (empty when disabled). */
  getModules() {
    this._reads += 1;
    return [...this._modules.keys()];
  }

  /** @param {string} moduleId @returns {import('../../../types/controlled-dev-dataset.js').ControlledRecord[]} */
  getRecords(moduleId) {
    this._reads += 1;
    const m = this._modules.get(moduleId);
    return m ? safeClone(m.records) : [];
  }

  /** @param {string} moduleId @param {string} id */
  getRecordById(moduleId, id) {
    const m = this._modules.get(moduleId);
    if (!m) return null;
    const rec = m.records.find((r) => r.id === id);
    return rec ? safeClone(rec) : null;
  }

  /** @param {string} moduleId */
  getTableRows(moduleId) {
    const m = this._modules.get(moduleId);
    return m ? safeClone(m.tableRows) : [];
  }

  /** @param {string} moduleId @param {string} recordId */
  getFormValues(moduleId, recordId) {
    const m = this._modules.get(moduleId);
    if (!m) return null;
    const values = m.formValues[recordId];
    return values ? safeClone(values) : null;
  }

  /** @returns {import('../../../types/controlled-dev-dataset.js').ControlledDatasetDiagnostics} */
  getDiagnostics() {
    /** @type {Record<string, unknown>} */
    const modules = {};
    /** @type {string[]} */
    const warnings = [];
    for (const [id, m] of this._modules) {
      modules[id] = { ...m.diagnostics };
      for (const w of m.diagnostics.warnings) warnings.push(`[${id}] ${w}`);
    }
    return {
      enabled: this._enabled,
      moduleCount: this._modules.size,
      modules: /** @type {any} */ (safeClone(modules)),
      warnings,
    };
  }

  /**
   * Returns a compact, safe per-module summary for the hub. Empty when disabled.
   * @returns {Record<string, import('../../../types/controlled-dev-dataset.js').ControlledDatasetModuleSummary>}
   */
  getSummaryByModule() {
    /** @type {Record<string, any>} */
    const out = {};
    for (const [id, m] of this._modules) {
      const sampleRow = m.tableRows[0] ? safeClone(m.tableRows[0]) : null;
      out[id] = {
        datasetStatus: 'available',
        recordCount: m.diagnostics.recordCount,
        validCount: m.diagnostics.validCount,
        invalidCount: m.diagnostics.invalidCount,
        deniedFieldCount: m.diagnostics.deniedFieldCount,
        sampleRowPreview: sampleRow,
        datasetDiagnostics: safeClone(m.diagnostics),
      };
    }
    return out;
  }

  /** Resets the internal read counter (data is static; nothing else to clear). */
  clear() {
    this._reads = 0;
  }
}

/**
 * @param {ConstructorParameters<typeof ControlledDevDataset>[0]} [options]
 * @returns {ControlledDevDataset}
 */
export function createControlledDevDataset(options) {
  return new ControlledDevDataset(options);
}

export { createEmpresasControlledDataset, createCadcpsControlledDataset };
