import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { createEmpresasPermissionMatrix } from '../hardening/createEmpresasPermissionMatrix.js';
import { createEmpresasCanonicalFixtures } from './createEmpresasCanonicalFixtures.js';

const RULES = [
  'read requires a valid permission',
  'absence of permission blocks',
  'empty permission blocks',
  'invalid permission blocks',
  'other-module permission blocks',
  'partial permission is fail-closed',
  'synthetic admin stays read-only',
  'permission does not bypass tenant',
  'permission does not bypass header',
  'permission does not bypass token state',
  'no permission enables mutation',
  'permission bypass invalidates certification',
];

/**
 * Canonical permission rules + a live bypass check over the certification fixtures.
 * Pure aside from local reads.
 *
 * @param {Object} [options]
 * @returns {Object} permission rules descriptor
 */
export function createEmpresasCanonicalPermissionRules(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const fixtures = isGenericModelPlainObject(o.fixtures) ? o.fixtures : createEmpresasCanonicalFixtures({ profile: 'certification-small' });
  const matrix = createEmpresasPermissionMatrix({ dataset: { records: fixtures.records, tenants: fixtures.tenants } });

  const body = {
    kind: 'empresas-canonical-permission-rules',
    rules: [...RULES],
    ruleCount: RULES.length,
    failClosed: true,
    mutationPermissionExists: false,
    permissionBypassAllowed: false,
    certificationBlockerOnBypass: true,
    permissionBypassFound: matrix.permissionBypassFound === true,
    profileCount: matrix.total,
  };
  return safeCloneGenericModel({ ...body, permissionRulesDigest: createGenericModelChecksum({ value: { rules: RULES, bypass: body.permissionBypassFound } }) });
}

export default createEmpresasCanonicalPermissionRules;
