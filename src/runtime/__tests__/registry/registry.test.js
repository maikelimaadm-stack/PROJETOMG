import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRegistry } from '../../core/registry/registryManager.js';
import { REGISTRY_TYPES } from '../../core/registry/registryTypes.js';
import { RegistryError } from '../../core/registry/errors.js';

describe('M04 — Universal Registry', () => {
  it('registers and resolves all 12 registry types', () => {
    const registry = createRegistry();

    for (const type of REGISTRY_TYPES) {
      registry.register(type, `${type}-key`, () => ({ type, id: `${type}-key` }));
      assert.equal(registry.has(type, `${type}-key`), true);
      const resolved = registry.resolve(type, `${type}-key`);
      assert.equal(resolved.type, type);
    }
  });

  it('lookup returns keys per type', () => {
    const registry = createRegistry();
    registry.register('entity', 'empresa', () => ({ name: 'Empresa' }));
    registry.register('entity', 'cliente', () => ({ name: 'Cliente' }));
    registry.register('route', 'home', () => ({ path: '/' }));

    assert.deepEqual(registry.keys('entity').sort(), ['cliente', 'empresa']);
    assert.deepEqual(registry.keys('route'), ['home']);
  });

  it('throws on duplicate key registration', () => {
    const registry = createRegistry();
    registry.register('action', 'save', () => ({ id: 'save' }));

    assert.throws(
      () => registry.register('action', 'save', () => ({ id: 'duplicate' })),
      (err) => err instanceof RegistryError && err.code === 'MAK-L3-REGISTRY-001',
    );
  });

  it('throws on resolve of missing entry', () => {
    const registry = createRegistry();
    assert.throws(
      () => registry.resolve('handler', 'missing'),
      (err) => err instanceof RegistryError && err.code === 'MAK-L3-REGISTRY-002',
    );
  });

  it('validates registry type on register', () => {
    const registry = createRegistry();
    assert.throws(
      () => registry.register('invalid-type', 'key', () => ({})),
      (err) => err instanceof RegistryError && err.code === 'MAK-L3-REGISTRY-002',
    );
  });

  it('rejects registration after freeze (post-hydrate)', () => {
    const registry = createRegistry();
    registry.register('entity', 'empresa', () => ({ id: 'empresa' }));
    registry.freeze();

    assert.equal(registry.isFrozen, true);
    assert.throws(
      () => registry.register('entity', 'new', () => ({})),
      (err) => err instanceof RegistryError && err.code === 'MAK-L3-REGISTRY-003',
    );
  });

  it('allows resolve after freeze', () => {
    const registry = createRegistry();
    registry.register('renderer', 'table', () => ({ view: 'table' }));
    registry.freeze();

    const resolved = registry.resolve('renderer', 'table');
    assert.equal(resolved.view, 'table');
  });

  it('isolates registry instances in memory', () => {
    const registryA = createRegistry();
    const registryB = createRegistry();

    registryA.register('plugin', 'a', () => ({ id: 'a' }));
    registryB.register('plugin', 'b', () => ({ id: 'b' }));

    assert.equal(registryA.has('plugin', 'a'), true);
    assert.equal(registryA.has('plugin', 'b'), false);
    assert.equal(registryB.has('plugin', 'b'), true);
    assert.throws(() => registryA.resolve('plugin', 'b'));
  });
});
