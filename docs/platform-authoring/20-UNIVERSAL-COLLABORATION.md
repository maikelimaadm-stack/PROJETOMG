# 20 — Universal Collaboration

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-16

---

## Multi-user model

| Mechanism | Behavior |
|-----------|----------|
| Optimistic lock | `revision` on save — 409 on conflict |
| Edit lock (optional) | Studio exclusive edit 300s |
| Presence | Show who views object |
| Comments | Thread on objectId |
| Suggestions | Proposed patch — reviewer accepts |

---

## Roles in collaboration

| Role | Capabilities |
|------|--------------|
| Author | edit draft |
| Reviewer | approve/reject |
| Publisher | trigger publish |
| Admin | restore, archive, delete |
| Viewer | read-only |

---

## Conflict resolution

| Scenario | Resolution |
|----------|------------|
| Simultaneous save | Last wins with revision — loser refreshes |
| Conflicting fork | Manual merge in designer |
| Publish in progress | Block edits to approved scope |

---

## Audit

All collaboration actions → audit log + `object.lifecycle.transitioned`.

---

*End of document.*
