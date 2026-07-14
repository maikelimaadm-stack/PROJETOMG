import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Builds a deterministic metadata-only LAYOUT SCHEMA. Pure. Describes grid/positions/
 * responsive plan as metadata; no real CSS, no required Tailwind classes, no DOM layout.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox] a module preview sandbox contract
 * @returns {Object} layout schema metadata
 */
export function createDevPreviewLayoutSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.sandbox) ? o.sandbox : {};
  const table = isGenericModelPlainObject(s.tablePreviewMetadata) ? s.tablePreviewMetadata : {};
  const form = isGenericModelPlainObject(s.formPreviewMetadata) ? s.formPreviewMetadata : {};
  const colCount = Array.isArray(table.columns) ? table.columns.length : 0;
  const fieldCount = Array.isArray(form.fields) ? form.fields.length : 0;

  const core = {
    kind: 'dev-preview-layout-schema',
    layoutSchemaVersion: 'dev-preview-layout-schema@1.0.0',
    moduleId: String(s.moduleId ?? 'plannedModule'),
    layoutKind: 'cadastro-standard',
    screenDensity: 'comfortable',
    grid: { columns: 12, gutter: 'md', metadataOnly: true },
    sectionOrder: ['toolbar', 'table', 'form', 'detail', 'diagnostics'],
    positions: {
      table: { area: 'main', order: 1, columnSpan: 12, columnCount: colCount },
      form: { area: 'main', order: 2, columnSpan: 12, fieldCount },
      detail: { area: 'aside', order: 3, columnSpan: 12, readOnly: true },
    },
    responsivePlan: {
      breakpoints: ['sm', 'md', 'lg'],
      collapseTableToCardsBelow: 'md',
      metadataOnly: true,
    },
    realCss: false,
    requiredTailwindClasses: false,
    domLayout: false,
    metadataOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, layoutSchemaDigest: bridgeDigest(core) });
}

export default createDevPreviewLayoutSchema;
