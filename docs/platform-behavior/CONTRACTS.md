# Platform Behavior Contracts

**Status:** Official SSOT · **Version:** 1.0.0

---

## Contract matrix

| From | To | Contract | Document |
|------|-----|----------|----------|
| Studio | MMM API | USM `create`/`edit` only in draft | 16-USM |
| MMM API | Publish Engine | Only `approved` scope | 15-DEPLOYMENT |
| Publish Engine | Runtime | Signed `mmm-crb-v1` | 07-RUNTIME |
| Runtime | GR | CRB field configs | 13-DATA |
| Runtime | Event Bus | Post-commit events | 12-EVENT |
| AI Gateway | MMM | AICandidate only | 11-AI |
| Action Engine | Workflow | `triggerWorkflow` | 23-EXECUTION |
| Marketplace | MMM | Install → draft | 10-MARKETPLACE |
| Auth | Runtime | AccessScope | 14-SECURITY |
| Pin Service | Runtime | bundleId + version | 07-RUNTIME |

---

## Behavioral invariants

| ID | Invariant |
|----|-----------|
| INV-01 | No object reaches `running` without signed CRB |
| INV-02 | No state transition without audit log |
| INV-03 | No mutation without tenant scope |
| INV-04 | No AI direct write |
| INV-05 | No event before commit |
| INV-06 | No cache serve stale CRB version |
| INV-07 | Fail-closed on undefined behavior |

---

*End of document.*
