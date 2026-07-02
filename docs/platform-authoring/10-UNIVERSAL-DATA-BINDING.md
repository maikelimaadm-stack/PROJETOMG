# 10 — Universal Data Binding

**Status:** Official SSOT · **Version:** 1.0.0

---

## Definition

**Data binding** connects UI artifacts to Business Object fields and queries.

---

## Binding schema

```yaml
bind:
  data:
    source: record | query | formula
    boRef: code://module/empresa
    fieldRef: code://module/empresa/field/nome
    queryRef: code://reports/empresa_list
    path: nome
    mode: read | write | readwrite
```

---

## Binding modes

| Mode | Use |
|------|-----|
| read | Labels, lists, reports |
| write | Form inputs |
| readwrite | Editable grid |
| computed | Formula-bound — read-only display |

---

## View binding

| view mode | Binding |
|-----------|---------|
| table | query.list → columns → fieldRefs |
| form | record → field layout |
| kanban | query.list → groupBy field |
| dashboard | query.aggregate → widget |

---

## Compile

Data bindings → CRB V15 layout registry + V14 field map.

Runtime GR loads/saves via bound field codes.

---

*End of document.*
