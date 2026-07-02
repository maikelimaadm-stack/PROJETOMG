# 12 — Universal Event Binding

**Status:** Official SSOT · **Version:** 1.0.0

---

## Definition

**Event binding** wires domain events to automations, actions, or workflows.

```yaml
bind:
  event:
    on: record.created | record.updated | workflow.completed
    filter:
      boRef: code://module/empresa
      expression: "FIELD(status) = 'active'"
    target:
      type: automation | action | workflow
      ref: code://module/empresa/automation/notify
```

---

## Event sources (authorable)

| Source | Events |
|--------|--------|
| Record | created, updated, deleted |
| Workflow | started, completed, failed |
| Action | executed |
| Schedule | cron (via automation) |

Catalog: [platform-behavior/17-UNIVERSAL-EVENTS.md](../platform-behavior/17-UNIVERSAL-EVENTS.md).

---

## Authoring

**Event Designer** + **Automation Designer** — visual wiring emitting UAL bind blocks.

---

## Compile

→ CRB automation registry + event subscription manifest.

---

*End of document.*
