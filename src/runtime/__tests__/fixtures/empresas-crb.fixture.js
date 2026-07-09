import {
  MMM_CRB_VERSION,
  MMM_PUBLISH_PIPELINE_VERSION,
  hashPayload,
  signIntegrityHash,
  computeIntegrityHash,
} from '../../core/crb/crbConstants.js';

/**
 * Valid signed CRB fixture for Foundation C.3 tests (empresas module).
 * @param {Object} [overrides]
 */
export function buildEmpresasCrbFixture(overrides = {}) {
  const tenantId = overrides.tenantId ?? 'tenant-a';
  const moduleId = overrides.moduleId ?? 'empresas';
  const definitionVersionId = overrides.definitionVersionId ?? 'dv-empresas-v1';
  const bundleId = overrides.bundleId ?? `${tenantId}.${moduleId}.modelobase1.${definitionVersionId}`;

  const registries = {
    layout: {
      [moduleId]: [
        { objectId: 'layout-1', objectType: 'layout', code: 'empresas_layout', payload: { routePath: '/empresas' } },
      ],
    },
    field: {
      [moduleId]: [{ objectId: 'field-1', objectType: 'field', code: 'razao_social', payload: { dataType: 'string' } }],
    },
    validation: {
      [moduleId]: [
        { objectId: 'val-1', objectType: 'validation', code: 'empresas_validation', payload: { rules: [{ rule: 'required', field: 'razao_social' }] } },
      ],
    },
    formula: {
      [moduleId]: [{ objectId: 'formula-1', objectType: 'formula', code: 'full_name', payload: { engine: 'V17' } }],
    },
    event: {
      [moduleId]: [{ objectId: 'event-1', objectType: 'event', code: 'empresa.created', payload: { engine: 'V18' } }],
    },
    action: {
      [moduleId]: [{ objectId: 'action-1', objectType: 'action', code: 'empresa.save', payload: { engine: 'V19' } }],
    },
    workflow: {
      [moduleId]: [{ objectId: 'wf-1', objectType: 'workflow', code: 'empresa_approval', payload: { engine: 'V20' } }],
    },
    permission: {
      [moduleId]: overrides.permissionEntries ?? [
        { objectId: 'perm-1', objectType: 'permission', code: 'empresa.read', payload: { effect: 'allow' } },
      ],
    },
    baseTemplate: {
      [moduleId]: [{ objectId: 'tpl-1', objectType: 'base_template', code: 'modelobase1', payload: {} }],
    },
  };

  const route = [{ objectId: 'route-1', path: '/empresas', moduleId }];
  const menu = [];
  const objects = [
    { objectId: 'entity-1', objectType: 'entity', payload: { code: 'empresa' } },
    { objectId: 'view-1', objectType: 'view', payload: { code: 'empresas_list' } },
    { objectId: 'int-1', objectType: 'integration', payload: { code: 'http_connector' } },
    { objectId: 'plugin-1', objectType: 'plugin', payload: { code: 'empresas_plugin' } },
  ];

  const contentHash = hashPayload(objects);
  const integrityBase = {
    contentHash,
    registries,
    routes: route,
    menu,
    pipelineVersion: MMM_PUBLISH_PIPELINE_VERSION,
    crbVersion: MMM_CRB_VERSION,
  };
  const integrityHash = hashPayload(integrityBase);

  /** @type {import('../../types/crb.js').CrbPayload} */
  const crb = {
    crbVersion: MMM_CRB_VERSION,
    bundleId,
    definitionVersionId,
    tenantId,
    moduleId,
    baseTemplateId: 'modelobase1',
    contentHash,
    integrityHash,
    signatureRef: null,
    registries,
    route,
    menu,
    objects,
    capabilities: {
      engines: ['V13', 'V14', 'V16', 'V17', 'V18', 'V19', 'V20'],
      views: ['view-1'],
    },
    metadata: {
      objectCount: objects.length,
      semver: '1.0.0',
    },
    ...overrides.crb,
  };

  crb.integrityHash = computeIntegrityHash(crb);
  crb.signatureRef = overrides.unsigned ? null : signIntegrityHash(crb.integrityHash, overrides.signingKey);

  if (overrides.tamperHash) {
    crb.integrityHash = 'invalid-hash';
  }

  return crb;
}

/**
 * @param {import('../../types/crb.js').CrbPayload} crb
 */
export function buildEnvironmentPinFromCrb(crb, applicationId = 'app-erp', environment = 'dev') {
  return {
    tenantId: crb.tenantId,
    applicationId,
    environment,
    bundleId: crb.bundleId,
    definitionVersionId: crb.definitionVersionId,
    moduleId: crb.moduleId,
    baseTemplateId: crb.baseTemplateId,
  };
}
