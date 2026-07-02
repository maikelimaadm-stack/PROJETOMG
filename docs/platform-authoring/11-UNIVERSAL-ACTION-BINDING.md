# 11 — Universal Action Binding

**Status:** Official SSOT · **Version:** 1.0.0

---

## Definition

**Action binding** connects UI controls to MMM `action` objects.

```yaml
bind:
  action:
    actionRef: code://module/empresa/action/save
    trigger: click | submit | contextMenu
    confirm:
      required: true
      message: { "pt-BR": "Confirmar exclusão?" }
    params:
      recordId: "{record.id}"
```

---

## Binding targets

| Control | Typical actions |
|---------|-----------------|
| Button | save, delete, navigate |
| Row action | edit, duplicate |
| Bulk toolbar | export, batch update |
| Menu item | navigate, workflow |

---

## Execution path

UI → UEP Action message → Action Engine → handler ([platform-protocol/07](../platform-protocol/07-UNIVERSAL-ACTION.md)).

---

## Permission binding

Action inherits `permissionRef` from action object — evaluated at RT-5.

---

## Undo binding

Destructive actions declare `undoActionRef` optional.

---

*End of document.*
