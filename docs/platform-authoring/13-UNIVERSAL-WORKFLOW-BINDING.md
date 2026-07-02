# 13 — Universal Workflow Binding

**Status:** Official SSOT · **Version:** 1.0.0

---

## Definition

Links records, actions, and events to workflow definitions.

```yaml
bind:
  workflow:
    workflowRef: code://module/compras/workflow/po_approval
    trigger:
      type: action | event | manual
      actionRef: code://.../action/submit
    inputMapping:
      poId: "{record.id}"
      amount: "{record.valorTotal}"
```

---

## Step bindings

| Step type | Binding |
|-----------|---------|
| Human | roleRef, formRef |
| System | actionRef |
| Timer | duration expression |
| Gateway | condition expression |

---

## Start conditions

| Trigger | Authoring |
|---------|-----------|
| Action | Action Designer → triggerWorkflow |
| Event | Event binding |
| API | Integration inbound |
| Manual | BOS Operations queue |

---

## Compile

→ CRB V20 workflow registry.

---

*End of document.*
