# 17 — Universal Events Catalog

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PB-04

---

## Naming convention

`{domain}.{entity}.{action}` — lowercase, dot-separated.

Envelope: `{ eventId, eventType, tenantId, traceId, timestamp, payload, schemaVersion: "mak-event-v1" }` — field name **`eventType`** (not `type`); see [platform-protocol/08-UNIVERSAL-EVENT.md](../platform-protocol/08-UNIVERSAL-EVENT.md).

---

## Object lifecycle events

| Event | Publisher | Payload |
|-------|-----------|---------|
| `object.lifecycle.transitioned` | MMM API | objectId, from, to, operation |
| `object.created` | MMM API | objectId, objectType |
| `object.updated` | MMM API | objectId, revision |
| `object.deleted` | MMM API | objectId |
| `object.published` | Publish Engine | objectId, definitionVersionId |
| `object.activated` | Pin Service | objectId, environment |
| `object.deprecated` | Publish Engine | objectId |
| `object.rollback` | Pin Service | priorVersionId |

---

## MMM / Publish events

| Event | Publisher |
|-------|-----------|
| `mmm.object.created` | MMM API |
| `mmm.object.updated` | MMM API |
| `mmm.object.lifecycle` | MMM API |
| `mmm.publish.started` | Publish Engine |
| `mmm.publish.completed` | Publish Engine |
| `mmm.publish.failed` | Publish Engine |
| `mmm.cache.invalidated` | Publish Engine |

---

## Runtime events

| Event | Publisher |
|-------|-----------|
| `runtime.bootstrap.started` | Runtime |
| `runtime.bootstrap.completed` | Runtime |
| `runtime.crb.loaded` | Runtime |
| `runtime.crb.verify.failed` | Runtime |
| `runtime.route.matched` | Runtime |
| `runtime.render.completed` | Runtime |
| `runtime.session.started` | Runtime |
| `runtime.session.ended` | Runtime |
| `screen.viewed` | Runtime |

---

## Action events

| Event | Publisher |
|-------|-----------|
| `action.executed` | Action Engine |
| `action.failed` | Action Engine |
| `action.permission.denied` | Action Engine |

---

## Workflow events

| Event | Publisher | Notes |
|-------|-----------|-------|
| `workflow.started` | Workflow Engine | |
| `workflow.step.entered` | Workflow Engine | |
| `workflow.step.completed` | Workflow Engine | |
| `workflow.finished` | Workflow Engine | **Canonical** terminal success |
| `workflow.failed` | Workflow Engine | |
| `workflow.cancelled` | Workflow Engine | |

**Architecture aliases** (legacy names in [02-RUNTIME.md](../platform-architecture/02-RUNTIME.md), [09-WORKFLOW-ENGINE.md](../platform-architecture/09-WORKFLOW-ENGINE.md) — emit canonical name only):

| Alias | Canonical |
|-------|-----------|
| `workflow.completed` | `workflow.finished` |
| `workflow.transitioned` | `workflow.step.entered` |
| `workflow.escalated` | `workflow.step.entered` (escalation payload) |

---

## Record events

| Event | Publisher |
|-------|-----------|
| `record.created` | Generic Repository |
| `record.updated` | Generic Repository |
| `record.deleted` | Generic Repository |
| `record.archived` | Generic Repository |

---

## Security events

| Event | Publisher |
|-------|-----------|
| `security.login.success` | Auth |
| `security.login.failed` | Auth |
| `security.session.refreshed` | Auth |
| `security.session.revoked` | Auth |
| `permission.granted` | Admin |
| `permission.revoked` | Admin |

---

## Tenant / User events

| Event | Publisher |
|-------|-----------|
| `tenant.created` | Platform |
| `tenant.activated` | Platform |
| `tenant.suspended` | Platform |
| `tenant.cancelled` | Platform |
| `tenant.backup.completed` | Platform |
| `tenant.restored` | Platform |
| `user.invited` | Admin |
| `user.activated` | Auth |
| `user.suspended` | Admin |
| `user.blocked` | Admin |
| `user.deleted` | Admin |

---

## Marketplace events

| Event | Publisher |
|-------|-----------|
| `marketplace.package.published` | Marketplace |
| `marketplace.package.purchased` | Marketplace |
| `marketplace.package.installed` | Marketplace |
| `marketplace.package.updated` | Marketplace |
| `marketplace.package.removed` | Marketplace |

---

## AI events

| Event | Publisher |
|-------|-----------|
| `ai.request.started` | AI Gateway |
| `ai.candidate.created` | AI Gateway |
| `ai.candidate.approved` | Review UI |
| `ai.candidate.rejected` | Review UI |
| `ai.derivation.completed` | Resolver |

---

## Sync / Infrastructure events

| Event | Publisher |
|-------|-----------|
| `sync.conflict.detected` | Sync Service |
| `sync.completed` | Sync Service |
| `job.started` | Scheduler |
| `job.completed` | Scheduler |
| `job.failed` | Scheduler |

---

## Subscribers (default)

| Consumer | Subscribes to |
|----------|---------------|
| Audit Log | All `security.*`, `object.*`, `permission.*` |
| Workflow Engine | `record.*`, `action.executed` |
| L10 Intelligence | `record.*`, `workflow.*`, `action.*` |
| Runtime cache | `mmm.publish.completed` |
| Notifications | `workflow.*`, `marketplace.*`, `user.*` |

---

*End of document.*
