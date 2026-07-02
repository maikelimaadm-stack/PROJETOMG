# 16 — Universal Template System

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-13

---

## Template types

| Type | Scope |
|------|-------|
| Application template | Full app graph |
| Module template | Module + BOs |
| BO template | Standard entity pattern |
| Screen template | Layout + views |
| Workflow template | Approval chain |
| Dashboard template | Widget set |

---

## Inheritance

```yaml
template:
  extendsRef: mmm://object/{baseTemplateId}
  overrides:
    fields:
      - code: customField
        label: { "pt-BR": "Campo customizado" }
```

Merge at wizard generate or manual **Apply template** action.

---

## Marketplace templates

| Source | Install behavior |
|--------|------------------|
| MAK official | .makpkg → draft |
| ISV | Licensed package |
| Tenant shared | Internal marketplace |

---

## Template versioning

Templates versioned as MMM objects — semver in payload. Wizard picks latest compatible.

---

*End of document.*
