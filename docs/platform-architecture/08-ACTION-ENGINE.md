# 08 — Action Engine

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PA-05

---

## Objective

Define how **every button and operation** executes uniformly — save, delete, publish, workflow, API, marketplace.

---

## Architecture

```mermaid
flowchart TD
  UI[UI Control] --> AD[Action Dispatcher RT-8]
  AD --> REG[V19 Action Registry from CRB]
  REG --> H1[Built-in Handler]
  REG --> H2[Workflow Trigger]
  REG --> H3[Automation Trigger]
  REG --> H4[API Integration Handler]
  REG --> H5[Marketplace Action]
  H1 --> GR[Generic Repository]
  H2 --> WF[Workflow Engine]
  H3 --> EB[Event Bus]
  H4 --> EXT[External API]
```

---

## Action object model

MMM `action` objectType → CRB action registry entry:

| Field | Purpose |
|-------|---------|
| code | Stable handler key |
| actionKind | crud, navigate, workflow, integration, custom |
| targetRef | BO, workflow, integration id |
| permissionRef | Required permission |
| confirmation | UX gate |
| sideEffects | Events emitted |

---

## Built-in action catalog (closed)

| Action | actionKind | Handler |
|--------|------------|---------|
| save | crud | GR.create/update |
| delete | crud | GR.delete (soft/hard per policy) |
| duplicate | crud | GR.clone |
| publish | lifecycle | Publish API scope |
| navigate | navigate | Router |
| refresh | ui | Reload data |
| export | integration | Report/export service |
| import | integration | Import pipeline |
| install_package | marketplace | Marketplace install |

Custom actions declare `integration` handler — no inline JS.

---

## Execution contract

| Step | Responsibility |
|------|----------------|
| 1 | RT-5 permission check |
| 2 | Validate preconditions (validation V16) |
| 3 | Execute handler atomically where required |
| 4 | Emit domain events |
| 5 | Return structured result to UI |

Failures roll back transaction (records) or leave MMM unchanged.

---

## Workflow & automation triggers

Actions may `triggerWorkflow` or `emitAutomation` — delegated to [09-WORKFLOW-ENGINE.md](./09-WORKFLOW-ENGINE.md).

---

*End of document.*
