# 21 — Universal Marketplace Authoring

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-17

---

## Publish (ISV)

```mermaid
flowchart LR
  APP[Application graph] --> PKG[Package manifest]
  PKG --> SIGN[Sign .makpkg]
  SIGN --> MKP[Marketplace listing]
```

| Step | Actor | Output |
|------|-------|--------|
| Select scope | Publisher | Module or application |
| Generate manifest | Marketplace Designer | package object |
| Validate | Platform | Schema + deps |
| Sign | Publisher key | .makpkg |
| List | Marketplace | published listing |

---

## Sell

| Model | Config |
|-------|--------|
| Free | license: free |
| Subscription | plan tier mapping |
| Per-seat | quantity license |
| One-time | perpetual license |

---

## Install (tenant)

| Step | USM |
|------|-----|
| Purchase | license record |
| Install | draft MMM objects |
| Review | in_review → approved |
| Publish | tenant-scoped |
| Activate | pin |

Behavior: [platform-behavior/10-MARKETPLACE-LIFECYCLE.md](../platform-behavior/10-MARKETPLACE-LIFECYCLE.md).

---

## Update

New package version → install creates diff draft → review → publish → deprecate prior.

---

*End of document.*
