import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createDependencyResolver } from '../../core/dependency/dependencyResolver.js';
import { DependencyError } from '../../core/dependency/errors.js';
import { DependencySorter } from '../../core/dependency/DependencySorter.js';
import { buildEmpresasCrbFixture } from '../fixtures/empresas-crb.fixture.js';
import { buildDependencyGraphFixture } from '../fixtures/dependency-graph.fixture.js';

describe('M07 — Dependency Resolver', () => {
  it('resolves simple dependency order', () => {
    const resolver = createDependencyResolver();
    const crb = buildEmpresasCrbFixture();
    crb.objects = buildDependencyGraphFixture();

    const graph = resolver.resolveFromCrb(crb, ['empresas']);
    assert.deepEqual(graph.initOrder[0], 'obj-base');
    assert.ok(graph.initOrder.indexOf('obj-child') > graph.initOrder.indexOf('obj-base'));
    assert.equal(graph.valid !== false, true);
  });

  it('resolves multiple dependencies', () => {
    const resolver = createDependencyResolver();
    const crb = buildEmpresasCrbFixture();
    crb.objects = buildDependencyGraphFixture();

    const graph = resolver.resolveFromCrb(crb);
    assert.ok(graph.initOrder.includes('obj-base'));
    assert.ok(graph.initOrder.includes('obj-grand'));
    assert.equal(graph.dependencyCount, 3);
  });

  it('resolves deep dependency chain', () => {
    const resolver = createDependencyResolver();
    const crb = buildEmpresasCrbFixture();
    crb.objects = buildDependencyGraphFixture({ deep: true });

    const graph = resolver.resolveFromCrb(crb);
    assert.deepEqual(graph.initOrder, ['obj-d', 'obj-c', 'obj-b', 'obj-a']);
    assert.equal(graph.maxDepth, 3);
  });

  it('detects direct cycle', () => {
    const resolver = createDependencyResolver();
    const crb = buildEmpresasCrbFixture();
    crb.objects = buildDependencyGraphFixture({ withCycle: true });

    assert.throws(
      () => resolver.resolveFromCrb(crb),
      (err) => err instanceof DependencyError && err.code === 'MAK-L3-DEP-001',
    );
  });

  it('detects indirect cycle via detectCycles()', () => {
    const nodeIds = ['a', 'b', 'c'];
    const adjacency = new Map([
      ['a', ['b']],
      ['b', ['c']],
      ['c', ['a']],
    ]);

    assert.throws(
      () => DependencySorter.topologicalSort(nodeIds, adjacency),
      (err) => err instanceof DependencyError && err.code === 'MAK-L3-DEP-001',
    );
  });

  it('throws on missing dependency reference', () => {
    const resolver = createDependencyResolver();
    const crb = buildEmpresasCrbFixture();
    crb.objects = buildDependencyGraphFixture({ withMissing: true });

    assert.throws(
      () => resolver.resolveFromCrb(crb),
      (err) => err instanceof DependencyError && err.code === 'MAK-L3-DEP-002',
    );
  });

  it('validates required modules', () => {
    const resolver = createDependencyResolver();
    const crb = buildEmpresasCrbFixture();
    crb.objects = [{ objectId: 'x', objectType: 'field', scope: { moduleId: 'other' } }];

    assert.throws(
      () => resolver.resolveFromCrb(crb, ['empresas']),
      (err) => err instanceof DependencyError && err.code === 'MAK-L3-DEP-003',
    );
  });

  it('returns topological order via resolveOrder()', () => {
    const resolver = createDependencyResolver();
    const crb = buildEmpresasCrbFixture();
    crb.objects = buildDependencyGraphFixture({ deep: true });
    resolver.resolveFromCrb(crb);

    assert.deepEqual(resolver.resolveOrder(), ['obj-d', 'obj-c', 'obj-b', 'obj-a']);
    assert.equal(resolver.detectCycles(), null);
  });

  it('registerModule stores module dependency metadata', () => {
    const resolver = createDependencyResolver();
    resolver.registerModule('empresas', ['core', 'auth']);
    resolver.registerModule('core', []);
    assert.equal(resolver.state, 'pending');
  });
});
