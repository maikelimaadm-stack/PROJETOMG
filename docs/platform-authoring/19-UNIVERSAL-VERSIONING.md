# 19 — Universal Versioning

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-15

---

## Version dimensions

| Dimension | Mechanism |
|-----------|-----------|
| Object revision | `revision` on envelope |
| Object history | `mmm_object_version` |
| Publish version | `definitionVersionId` |
| Application semver | payload.version |
| Package semver | `package_version` |

---

## Compare and diff

| View | Shows |
|------|-------|
| Object diff | JSON patch between revisions |
| Graph diff | Added/removed/changed objects |
| CRB diff | Registry entry changes |
| Runtime impact | Affected routes, permissions |

---

## Rollback

| Level | Operation |
|-------|-----------|
| Object | restore to draft from version |
| Publish | EnvironmentPin rollback |
| Application | Pin to prior DefinitionVersion |

Not delete — deprecate ([D-PB-24](../platform-behavior/DECISIONS.md)).

---

## Branches (fork)

| Operation | Use |
|-----------|-----|
| fork | Experiment on published base |
| clone | New object lineage |
| merge | Manual reconcile — no auto-merge v1 |

---

*End of document.*
