import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createContext } from '../../core/context/createContext.js';
import { RuntimeContext } from '../../core/context/RuntimeContext.js';
import { ContextError } from '../../core/context/errors.js';

describe('M02 — RuntimeContext', () => {
  it('assigns traceId on every instance', () => {
    const ctx = createContext({ tenantId: 'tenant-a', userId: 'user-1' });
    assert.ok(ctx.traceId);
    assert.match(ctx.traceId, /^[0-9a-f-]{36}$/i);
  });

  it('preserves explicit traceId', () => {
    const traceId = '00000000-0000-4000-8000-000000000001';
    const ctx = createContext({ tenantId: 't1', traceId });
    assert.equal(ctx.traceId, traceId);
  });

  it('is immutable after creation', () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    assert.throws(() => {
      /** @type {Record<string, unknown>} */ (ctx).tenantId = 'hacked';
    }, /Cannot assign|read only|read-only/i);
  });

  it('child() returns new immutable context', () => {
    const parent = createContext({ tenantId: 'tenant-a', userId: 'u1' });
    const child = parent.child({ userId: 'u2' });
    assert.notEqual(child, parent);
    assert.equal(child.tenantId, 'tenant-a');
    assert.equal(child.userId, 'u2');
    assert.equal(child.traceId, parent.traceId);
    assert.throws(() => {
      /** @type {Record<string, unknown>} */ (child).locale = 'en-US';
    }, /Cannot assign|read only|read-only/i);
  });

  it('throws on cross-tenant child scope', () => {
    const parent = createContext({ tenantId: 'tenant-a', userId: 'u1' });
    assert.throws(
      () => parent.child({ tenantId: 'tenant-b' }),
      (err) => err instanceof ContextError && err.code === 'MAK-L2-CONTEXT-001',
    );
  });

  it('throws on cross-tenant accessScope in child', () => {
    const parent = createContext({ tenantId: 'tenant-a', userId: 'u1' });
    assert.throws(
      () => parent.child({ accessScope: { tenantId: 'tenant-b', userId: 'u1', companies: [], permissions: [], locale: 'pt-BR' } }),
      (err) => err instanceof ContextError && err.code === 'MAK-L2-CONTEXT-001',
    );
  });

  it('RuntimeContext is frozen', () => {
    const ctx = new RuntimeContext({
      tenantId: 't',
      userId: 'u',
      traceId: 'trace',
      locale: 'pt-BR',
      accessScope: { tenantId: 't', userId: 'u', companies: [], permissions: [], locale: 'pt-BR' },
    });
    assert.equal(Object.isFrozen(ctx), true);
    assert.equal(Object.isFrozen(ctx.accessScope), true);
  });
});
