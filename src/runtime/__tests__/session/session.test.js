import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createContext } from '../../core/context/createContext.js';
import { SessionFactory, createSessionManager } from '../../core/session/SessionFactory.js';
import { RuntimeSession } from '../../core/session/RuntimeSession.js';
import { SessionState } from '../../core/session/SessionState.js';
import { SessionError } from '../../core/session/errors.js';
import { createMockL1Auth } from '../../core/session/mockL1Auth.js';
import { WebSessionManager } from '../../core/session/webSession.js';

describe('M03 — Runtime Session', () => {
  it('creates anonymous session manager from context', () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);
    assert.ok(manager instanceof WebSessionManager);
    assert.equal(manager.getAccessScope(), null);
    assert.equal(manager.state, SessionState.ANONYMOUS);
  });

  it('authenticates with mock L1 and populates AccessScope', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = SessionFactory.createManager(ctx);
    const scope = await manager.authenticate({
      username: 'kaiman',
      password: 'kaiman',
      tenantId: 'tenant-a',
    });

    assert.equal(scope.tenantId, 'tenant-a');
    assert.equal(scope.userId, 'user-kaiman');
    assert.deepEqual(scope.permissions, ['read', 'write']);
    assert.equal(manager.state, SessionState.AUTHENTICATED);
    assert.equal(manager.getAccessScope()?.userId, 'user-kaiman');
    assert.equal(manager.getContext().traceId, ctx.traceId);
  });

  it('creates immutable RuntimeSession snapshot with traceId', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);
    await manager.authenticate({ username: 'kaiman', password: 'kaiman', tenantId: 'tenant-a' });

    const snapshot = manager.getSnapshot();
    assert.ok(snapshot instanceof RuntimeSession);
    assert.equal(snapshot.traceId, ctx.traceId);
    assert.equal(snapshot.isAuthenticated, true);
    assert.equal(Object.isFrozen(snapshot), true);
    assert.equal(Object.isFrozen(snapshot.scope), true);
  });

  it('refreshes session and returns new AccessScope', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);
    await manager.authenticate({ username: 'maike', password: 'maike', tenantId: 'tenant-a' });
    const before = manager.accessToken;

    const scope = await manager.refresh();
    assert.equal(scope.userId, 'user-maike');
    assert.notEqual(manager.accessToken, before);
    assert.equal(manager.state, SessionState.AUTHENTICATED);
  });

  it('performs silent refresh when access token expired', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const auth = createMockL1Auth({ accessTokenTtlMs: 1 });
    const manager = SessionFactory.createManager(ctx, auth);
    await manager.authenticate({ username: 'kaiman', password: 'kaiman', tenantId: 'tenant-a' });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const scope = await manager.ensureFreshAccessScope();
    assert.equal(scope?.userId, 'user-kaiman');
    assert.equal(manager.state, SessionState.AUTHENTICATED);
  });

  it('logout invalidates AccessScope cache', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);
    await manager.authenticate({ username: 'kaiman', password: 'kaiman', tenantId: 'tenant-a' });

    await manager.logout();
    assert.equal(manager.getAccessScope(), null);
    assert.equal(manager.state, SessionState.DESTROYED);
    assert.equal(manager.getSnapshot(), null);
  });

  it('destroy clears session fail-closed', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);
    await manager.authenticate({ username: 'kaiman', password: 'kaiman', tenantId: 'tenant-a' });

    manager.destroy();
    assert.equal(manager.getAccessScope(), null);
    assert.equal(manager.state, SessionState.DESTROYED);

    await assert.rejects(
      () => manager.authenticate({ username: 'kaiman', password: 'kaiman', tenantId: 'tenant-a' }),
      (err) => err instanceof SessionError && err.code === 'MAK-L3-SESSION-003',
    );
  });

  it('fail-closed on invalid credentials', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);

    await assert.rejects(
      () => manager.authenticate({ username: 'kaiman', password: 'wrong', tenantId: 'tenant-a' }),
      (err) => err instanceof SessionError && err.code === 'MAK-L3-SESSION-001',
    );
    assert.equal(manager.getAccessScope(), null);
    assert.equal(manager.state, SessionState.ANONYMOUS);
  });

  it('throws on cross-tenant authentication (tenant isolation)', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);

    await assert.rejects(
      () => manager.authenticate({ username: 'kaiman', password: 'kaiman', tenantId: 'tenant-b' }),
      (err) => err instanceof SessionError && err.code === 'MAK-L2-SESSION-001',
    );
  });

  it('refresh fails without active session', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);

    await assert.rejects(
      () => manager.refresh(),
      (err) => err instanceof SessionError && err.code === 'MAK-L3-SESSION-003',
    );
  });

  it('refresh fails after logout (revoked token)', async () => {
    const ctx = createContext({ tenantId: 'tenant-a' });
    const manager = createSessionManager(ctx);
    await manager.authenticate({ username: 'kaiman', password: 'kaiman', tenantId: 'tenant-a' });
    const refreshToken = manager.refreshToken;
    await manager.logout();

    const auth = createMockL1Auth();
    await assert.rejects(
      () => auth.refresh(refreshToken),
      (err) => err instanceof SessionError && err.code === 'MAK-L3-SESSION-002',
    );
  });
});
