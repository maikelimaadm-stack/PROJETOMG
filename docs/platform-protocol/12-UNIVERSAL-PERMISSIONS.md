# 12 — Universal Permissions

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-12

---

## Rule

Permissions are **never scattered**. All checks go through **PermissionService.evaluate()** at pipeline stage 2.

---

## Evaluation input

```json
{
  "context": "UEC",
  "resource": "empresa",
  "action": "update",
  "recordId": "uuid|null",
  "fieldIds": ["nome"]
}
```

---

## Evaluation order

| Order | Check |
|-------|-------|
| 1 | Tenant status = running |
| 2 | User status = running |
| 3 | Plan feature flag |
| 4 | Role permission (RBAC) |
| 5 | ABAC (company, OU) |
| 6 | Field-level (V14) |
| 7 | Row-level (GR filter) |

First deny → stop, return MAK-L1-SECURITY-003.

---

## Permission sources

| Source | Precedence |
|--------|------------|
| CRB V18 permission registry | Primary at Runtime |
| MMM role/permission objects | Target (Foundation D) |
| Legacy UsuarioPerfil | Transitional — sunset E |

---

## Injection into UEC

After authorize stage:

```json
"permissions": {
  "effective": ["empresa:read", "empresa:update"],
  "computedAt": "ISO8601"
}
```

Handlers **read** UEC.permissions — they do not re-evaluate except for row-level GR filters.

---

## Action permission mapping

CRB V19 action entry includes `permissionRef` → resolved at dispatch.

---

*End of document.*
