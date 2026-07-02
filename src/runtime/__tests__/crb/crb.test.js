import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createCrbLoader } from '../../core/crb/crbLoader.js';
import { BundleReader } from '../../core/crb/BundleReader.js';
import { BundleMetadata } from '../../core/crb/BundleMetadata.js';
import { BundleIntegrity } from '../../core/crb/BundleIntegrity.js';
import { CrbError } from '../../core/crb/errors.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

describe('M06 — CRB Loader', () => {
  it('reads and parses CRB payload', () => {
    const crb = buildEmpresasCrbFixture();
    const parsed = BundleReader.read(JSON.stringify(crb));
    assert.equal(parsed.crbVersion, 'mmm-crb-v1');
    assert.equal(parsed.moduleId, 'empresas');
  });

  it('extracts bundle metadata', () => {
    const crb = buildEmpresasCrbFixture();
    const meta = BundleMetadata.extract(crb);
    assert.equal(meta.moduleId, 'empresas');
    assert.equal(meta.objectCount, crb.objects.length);
    assert.deepEqual(meta.engines, ['V13', 'V14', 'V16', 'V17', 'V18', 'V19', 'V20']);
  });

  it('verifies integrity hash and signature in dev', () => {
    const crb = buildEmpresasCrbFixture();
    const result = BundleIntegrity.verify(crb, 'dev');
    assert.equal(result.valid, true);
    assert.ok(result.validationsExecuted >= 2);
  });

  it('rejects hash mismatch', () => {
    const crb = buildEmpresasCrbFixture({ tamperHash: true });
    const result = BundleIntegrity.verify(crb, 'dev');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('integrityHash')));
  });

  it('rejects unsigned CRB in prod mode', () => {
    const crb = buildEmpresasCrbFixture({ unsigned: true });
    const crbLoader = createCrbLoader('prod');
    const pin = buildEnvironmentPinFromCrb(crb);

    const verification = crbLoader.verify(crb, pin);
    assert.equal(verification.valid, false);
    assert.ok(verification.errors.some((e) => e.includes('Unsigned') || e.includes('signatureRef')));
  });

  it('rejects invalid signature', () => {
    const crb = buildEmpresasCrbFixture();
    crb.signatureRef = 'mmm-sig-v1:invalid';
    const result = BundleIntegrity.verify(crb, 'dev');
    assert.equal(result.valid, false);
  });

  it('rejects invalid definition version pin', () => {
    const crb = buildEmpresasCrbFixture();
    const pin = { ...buildEnvironmentPinFromCrb(crb), definitionVersionId: 'wrong-version' };
    const crbLoader = createCrbLoader('dev');

    const verification = crbLoader.verify(crb, pin);
    assert.equal(verification.valid, false);
    assert.ok(verification.errors.some((e) => e.includes('DefinitionVersion')));
  });

  it('hydrates V13–V20 registries from fixture CRB', () => {
    const crb = buildEmpresasCrbFixture();
    const pin = buildEnvironmentPinFromCrb(crb);
    const registry = createRegistry();
    const crbLoader = createCrbLoader('dev');

    const verification = crbLoader.verify(crb, pin);
    assert.equal(verification.valid, true);

    const hydration = crbLoader.hydrate(crb, registry);
    assert.equal(hydration.success, true);
    assert.ok(hydration.entriesRegistered >= 10);
    assert.ok(registry.has('layout', 'empresas_layout'));
    assert.ok(registry.has('field', 'razao_social'));
    assert.ok(registry.has('action', 'empresa.save'));
    assert.ok(registry.has('workflow', 'empresa_approval'));
    assert.ok(registry.has('route', '/empresas'));
  });

  it('rolls back registry on duplicate hydrate failure', () => {
    const crb = buildEmpresasCrbFixture();
    const pin = buildEnvironmentPinFromCrb(crb);
    const registry = createRegistry();
    registry.register('layout', 'empresas_layout', () => ({ preexisting: true }));

    const crbLoader = createCrbLoader('dev');
    crbLoader.verify(crb, pin);

    assert.throws(() => crbLoader.hydrate(crb, registry), (err) => err instanceof CrbError);
    assert.equal(crbLoader.state, 'rolled_back');
    assert.equal(registry.has('field', 'razao_social'), false);
    assert.ok(registry.has('layout', 'empresas_layout'));
  });
});
