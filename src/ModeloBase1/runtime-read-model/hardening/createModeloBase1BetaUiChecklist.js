import { isPlainObject, findUnsafeContent, hasUnmaskedSensitive, hasForbiddenReference } from '../safety.js';

/**
 * Builds the beta UI hardening CHECKLIST for a single ModeloBase1 runtime read
 * state (the output of `applyModeloBase1RuntimeReadModel`). Pure, deterministic,
 * never throws on partial/missing data — malformed/empty inputs produce `warn`
 * or `skipped` items, never a crash. Categories: structure, table, form,
 * diagnostics, security, scope.
 *
 * Each item: { id, moduleId, category, status, severity, evidence, remediation, blocking }.
 *
 * @param {import('../types.js').ModeloBase1RuntimeReadState} state
 * @returns {Array<Object>}
 */
export function createModeloBase1BetaUiChecklist(state) {
  const s = isPlainObject(state) ? state : {};
  const moduleId = typeof s.moduleId === 'string' ? s.moduleId : 'unknown';
  const beta = s.betaApplied === true;
  const items = [];

  const push = (id, category, status, severity, evidence, remediation = null, blocking = false) => {
    items.push({ id, moduleId, category, status, severity, evidence, remediation, blocking });
  };

  // ---- structure ----
  const hasModuleId = typeof s.moduleId === 'string' && s.moduleId.length > 0;
  push(
    'structure.moduleId',
    'structure',
    hasModuleId ? 'pass' : (beta ? 'fail' : 'skipped'),
    'high',
    `moduleId=${JSON.stringify(s.moduleId ?? null)}`,
    'ensure the runtime read model carries a moduleId',
    beta,
  );
  push(
    'structure.runtimeReadModelPresent',
    'structure',
    s.runtimeReadModelPresent === true ? 'pass' : (beta ? 'fail' : 'skipped'),
    'medium',
    `present=${Boolean(s.runtimeReadModelPresent)}`,
    'attach config.runtimeReadModel behind the beta flag',
    false,
  );
  push(
    'structure.runtimeReadModelValidated',
    'structure',
    s.runtimeReadModelValid === true ? 'pass' : (beta ? 'fail' : 'skipped'),
    'medium',
    `valid=${Boolean(s.runtimeReadModelValid)}`,
    'read model must pass descriptor + payload validation',
    false,
  );
  push(
    'structure.fallbackSafe',
    'structure',
    beta || s.fallbackApplied === true ? 'pass' : 'warn',
    'high',
    `betaApplied=${beta}, fallbackApplied=${Boolean(s.fallbackApplied)}, reason=${s.fallbackReason ?? 'n/a'}`,
    'fallback must keep the legacy render when beta is off/invalid',
    false,
  );
  push(
    'structure.noSideEffects',
    'structure',
    s.noSideEffects !== false ? 'pass' : 'fail',
    'high',
    `noSideEffects=${s.noSideEffects !== false}`,
    'the read state must be passive (no side effects)',
    true,
  );

  // ---- table ---- (only meaningful when beta applied)
  const table = isPlainObject(s.table) ? s.table : null;
  if (!beta) {
    push('table.render', 'table', 'skipped', 'low', 'beta not applied — legacy table render', null, false);
  } else if (!table) {
    push('table.render', 'table', 'warn', 'medium', 'beta applied but table is null → engine keeps legacy table', 'provide table in the read payload', false);
  } else {
    const columns = Array.isArray(table.columns) ? table.columns : [];
    const visible = Array.isArray(table.visibleColumns) ? table.visibleColumns : [];
    const rows = Array.isArray(table.rows) ? table.rows : [];
    push('table.columns', 'table', columns.length > 0 ? 'pass' : 'warn', 'medium', `columnCount=${columns.length}`, 'read model should expose columns', false);
    const columnsWellFormed = columns.every((c) => isPlainObject(c) && typeof c.id === 'string');
    push('table.columnsWellFormed', 'table', columns.length === 0 ? 'skipped' : (columnsWellFormed ? 'pass' : 'warn'), 'medium', `wellFormed=${columnsWellFormed}`, 'each column needs a string id (partial columns → warn, safe)', false);
    const visibleCoherent = visible.every((c) => isPlainObject(c) && columns.some((k) => k.id === c.id)) || visible.length === 0;
    push('table.visibleColumnsCoherent', 'table', visibleCoherent ? 'pass' : 'warn', 'low', `visibleCount=${visible.length}`, 'visibleColumns should be a subset of columns', false);
    const rowsRenderable = rows.every((r) => isPlainObject(r) && (typeof r.id === 'string' || typeof r.id === 'number'));
    push('table.rowsRenderable', 'table', rows.length === 0 ? 'pass' : (rowsRenderable ? 'pass' : 'warn'), 'medium', `rowCount=${rows.length}, renderable=${rowsRenderable}`, 'rows need a stable id', false);
    push('table.emptyStateSafe', 'table', 'pass', 'low', `rowCount=${rows.length} (empty is a safe render)`, null, false);
    const maskedOk = !hasUnmaskedSensitive(rows);
    push('table.sensitiveMasked', 'table', maskedOk ? 'pass' : 'fail', 'high', `unmaskedSensitive=${!maskedOk}`, 'mask sensitive values before rendering', true);
  }

  // ---- form ----
  const form = isPlainObject(s.form) ? s.form : null;
  if (!beta) {
    push('form.render', 'form', 'skipped', 'low', 'beta not applied — legacy form render', null, false);
  } else if (!form) {
    push('form.render', 'form', 'warn', 'medium', 'beta applied but form is null → engine keeps legacy form', 'provide form in the read payload', false);
  } else {
    const fields = Array.isArray(form.fields) ? form.fields : [];
    const visibleFields = Array.isArray(form.visibleFields) ? form.visibleFields : [];
    push('form.fields', 'form', fields.length > 0 ? 'pass' : 'warn', 'medium', `fieldCount=${fields.length}`, 'read model should expose fields', false);
    const fieldsWellFormed = fields.every((f) => isPlainObject(f) && typeof f.id === 'string');
    push('form.fieldsWellFormed', 'form', fields.length === 0 ? 'skipped' : (fieldsWellFormed ? 'pass' : 'warn'), 'medium', `wellFormed=${fieldsWellFormed}`, 'each field needs a string id (partial fields → warn, safe)', false);
    const visibleFieldsCoherent = visibleFields.every((f) => isPlainObject(f) && fields.some((k) => k.id === f.id)) || visibleFields.length === 0;
    push('form.visibleFieldsCoherent', 'form', visibleFieldsCoherent ? 'pass' : 'warn', 'low', `visibleFieldCount=${visibleFields.length}`, 'visibleFields should be a subset of fields', false);
    push('form.readOnly', 'form', s.writeBlocked === true ? 'pass' : 'fail', 'high', `writeBlocked=${Boolean(s.writeBlocked)}`, 'form must be read-only in beta mode', true);
    push('form.noSubmit', 'form', s.writeBlocked === true ? 'pass' : 'fail', 'high', 'submit blocked when writeBlocked', 'block submit in beta mode', true);
    push('form.noSave', 'form', s.writeBlocked === true ? 'pass' : 'fail', 'high', 'save blocked when writeBlocked', 'block save in beta mode', true);
  }

  // ---- diagnostics ----
  const diag = isPlainObject(s.diagnostics) ? s.diagnostics : null;
  push('diagnostics.present', 'diagnostics', diag ? 'pass' : 'warn', 'low', `diagnostics=${diag ? 'present' : 'absent'} (absent is non-fatal)`, 'attach diagnostics for observability', false);
  push('diagnostics.betaApplied', 'diagnostics', typeof s.betaApplied === 'boolean' ? 'pass' : 'warn', 'low', `betaApplied=${s.betaApplied}`, null, false);
  push('diagnostics.fallbackReason', 'diagnostics', beta ? 'skipped' : (s.fallbackReason ? 'pass' : 'warn'), 'low', `fallbackReason=${s.fallbackReason ?? 'n/a'}`, 'fallback states should carry a reason', false);
  push('diagnostics.writeBlocked', 'diagnostics', typeof s.writeBlocked === 'boolean' ? 'pass' : 'warn', 'medium', `writeBlocked=${s.writeBlocked}`, null, false);
  push('diagnostics.source', 'diagnostics', typeof s.source === 'string' ? 'pass' : 'warn', 'low', `source=${s.source ?? 'n/a'}`, null, false);
  push(
    'diagnostics.warningsBlockers',
    'diagnostics',
    diag && (Array.isArray(diag.warnings) || Array.isArray(diag.blockers)) ? 'pass' : 'skipped',
    'low',
    diag ? `warnings=${(diag.warnings ?? []).length}, blockers=${(diag.blockers ?? []).length}` : 'no diagnostics',
    null,
    false,
  );

  // ---- security ---- (state-level; source-level invariants are gate-verified)
  push('security.writeBlocked', 'security', !beta || s.writeBlocked === true ? 'pass' : 'fail', 'high', `beta=${beta}, writeBlocked=${Boolean(s.writeBlocked)}`, 'writes must be blocked in beta mode', true);
  push('security.noRealData', 'security', s.source === 'runtime-v2-beta' || !beta ? 'pass' : 'warn', 'medium', `source=${s.source ?? 'n/a'}`, 'beta read must not use real data', false);
  const unsafe = findUnsafeContent({ table: s.table ?? null, form: s.form ?? null });
  push('security.noUnsafeContent', 'security', unsafe ? 'fail' : 'pass', 'high', unsafe ? unsafe : 'no function/handler/React element in read payload', 'read payload must be pure', Boolean(unsafe));
  push('security.noForbiddenRef', 'security', hasForbiddenReference({ table: s.table ?? null, form: s.form ?? null }) ? 'fail' : 'pass', 'high', 'no backend/fetch/Prisma/storage reference', 'read payload must not reference backend/fetch/Prisma/storage', false);

  // ---- scope ---- (verified mechanically by the slice gate; recorded as skipped here)
  push('scope.authorizedOnly', 'scope', 'skipped', 'medium', 'diff scope verified by g423-modelobase1-beta-ui-hardening gate', null, false);
  push('scope.appJsxUntouched', 'scope', 'skipped', 'medium', 'App.jsx untouched verified by gate', null, false);
  push('scope.menuUntouched', 'scope', 'skipped', 'low', 'menu untouched verified by gate', null, false);
  push('scope.otherScreensUntouched', 'scope', 'skipped', 'medium', 'other screens untouched verified by gate', null, false);

  return items;
}

export default createModeloBase1BetaUiChecklist;
