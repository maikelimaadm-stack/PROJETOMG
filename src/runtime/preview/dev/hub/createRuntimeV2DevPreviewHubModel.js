import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../../../shadow/pilots/tableFormProjection.js';
import { createEmpresasDevPreviewModel } from '../devPreviewConfig.js';
import { createEmpresasDevPreviewFixture } from '../createEmpresasDevPreviewFixture.js';
import { createSecondModuleDevPreviewFixture } from '../createSecondModuleDevPreviewFixture.js';
import {
  isRuntimeV2DevPreviewHubEnabled,
  detectEnvLabel,
  RUNTIME_V2_DEV_PREVIEW_HUB_FLAG,
} from './devPreviewHubConfig.js';
import { RuntimeV2DevPreviewHubError } from './errors.js';

/** @param {string} code @param {string} message */
function hubError(code, message) {
  return new RuntimeV2DevPreviewHubError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain HUB MODEL that aggregates the runtime v2
 * dev previews (Empresas + cadcps). It is never a DOM node / React element,
 * never executes an action/workflow/connector, never touches real data or the
 * backend. Sensitive keys are masked; prototype pollution in the options is
 * blocked; a per-module build failure is captured into that module's entry
 * (never thrown). The result is a safe deep copy.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env] Explicit env (dev harness); defaults to import.meta.env/process.env.
 * @returns {Promise<import('../../../types/dev-preview-hub.js').RuntimeV2DevPreviewHubModel>}
 */
export async function createRuntimeV2DevPreviewHubModel(options = {}) {
  validateProjectionInput(options, 0, 'Dev preview hub options', (_c, message) => hubError('MAK-L3-DEV-HUB-001', message));
  if (!isPlainObject(options)) {
    throw hubError('MAK-L3-DEV-HUB-002', 'createRuntimeV2DevPreviewHubModel() options must be a plain object');
  }

  const env = options.env;
  const enabled = isRuntimeV2DevPreviewHubEnabled(env);

  const modules = [
    await buildModuleEntry({ moduleId: 'empresas', moduleName: 'Empresas', source: 'empresas-specific-pipeline', build: () => createEmpresasDevPreviewFixture() }),
    await buildModuleEntry({ moduleId: 'cadcps', moduleName: 'Cadastro de Campos', source: 'generic-module-pipeline', build: () => createSecondModuleDevPreviewFixture() }),
  ];

  // Opt-in controlled dev dataset integration. Only attaches a per-module dataset
  // summary when a dataset instance is passed AND enabled — otherwise the hub is
  // byte-identical to before (dataset off = zero effect).
  let datasetIntegrated = false;
  const dataset = /** @type {any} */ (options).dataset;
  if (dataset && typeof dataset.isEnabled === 'function' && dataset.isEnabled() && typeof dataset.getSummaryByModule === 'function') {
    const summary = dataset.getSummaryByModule();
    for (const m of modules) {
      if (summary[m.moduleId]) {
        m.dataset = summary[m.moduleId];
        datasetIntegrated = true;
      }
    }
  }

  const warnings = [];
  for (const m of modules) {
    if (!m.ok) warnings.push(`module "${m.moduleId}" failed to build: ${m.error?.message ?? 'unknown'}`);
    if (m.ok && m.diagnostics.deniedFields.length > 0) warnings.push(`module "${m.moduleId}" has ${m.diagnostics.deniedFields.length} denied field(s)`);
  }

  const model = {
    kind: /** @type {'runtime-v2-dev-preview-hub'} */ ('runtime-v2-dev-preview-hub'),
    status: { enabled, devOnly: true, moduleCount: modules.length, mocked: true },
    environment: detectEnvLabel(env),
    flags: { hubFlag: RUNTIME_V2_DEV_PREVIEW_HUB_FLAG, hubEnabled: enabled, datasetIntegrated },
    modules,
    diagnostics: { warnings, totalModules: modules.length, availableModules: modules.filter((m) => m.ok).length },
    warnings,
    limitations: [
      'dev-only — never mounted in production navigation',
      'mocked data only — no real records, no backend, no Prisma',
      'passive — never executes actions/workflows/connectors, never saves',
    ],
  };
  // Safe, independent deep copy — mutating the returned model never reaches internal state.
  return /** @type {import('../../../types/dev-preview-hub.js').RuntimeV2DevPreviewHubModel} */ (safeClone(model));
}

/**
 * @param {{ moduleId: string, moduleName: string, source: string, build: () => (Promise<any>|any) }} spec
 */
async function buildModuleEntry(spec) {
  try {
    const previewModel = await spec.build();
    const view = createEmpresasDevPreviewModel(previewModel);
    return {
      moduleId: spec.moduleId,
      moduleName: spec.moduleName,
      source: spec.source,
      ok: true,
      previewModel: /** @type {any} */ (redactSensitive(safeClone(previewModel))),
      table: {
        columnCount: view.table.columns.length,
        visibleColumns: [...(view.table.columns.filter((c) => c.visible).map((c) => c.id))],
        columns: view.table.columns.map((c) => ({ id: c.id, label: c.label, sortable: c.sortable, filterable: c.filterable, visible: c.visible })),
      },
      form: {
        fieldCount: view.form.fields.length,
        visibleFields: view.form.fields.filter((f) => !f.denied).map((f) => f.id),
        fields: view.form.fields.map((f) => ({ id: f.id, label: f.label, type: f.type, required: f.required, permission: f.permission ?? '', denied: f.denied })),
      },
      diagnostics: view.diagnostics,
      differences: view.differences,
      actions: view.actions, // text metadata only
      workflows: view.workflows, // text metadata only
      metadata: view.metadata,
    };
  } catch (err) {
    // A per-module failure is captured — the hub never crashes because one module misbuilds.
    return {
      moduleId: spec.moduleId,
      moduleName: spec.moduleName,
      source: spec.source,
      ok: false,
      error: { name: err instanceof Error ? err.name : 'Error', message: err instanceof Error ? err.message : String(err) },
      table: { columnCount: 0, visibleColumns: [], columns: [] },
      form: { fieldCount: 0, visibleFields: [], fields: [] },
      diagnostics: { warnings: ['module build failed'], differences: [], deniedFields: [], missingLabels: [], invalidMetadata: [], unsupportedFeatures: [] },
      differences: [],
      actions: [],
      workflows: [],
      metadata: {},
    };
  }
}
