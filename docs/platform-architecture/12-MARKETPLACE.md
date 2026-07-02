# 12 — Marketplace Architecture

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PA-11

---

## Package format

**`.makpkg`** — ZIP containing:

| File | Content |
|------|---------|
| `manifest.json` | packageId, semver, objectTypes, dependencies |
| `objects/*.json` | MMM envelopes |
| `schemas/` | Optional pinned schema versions |
| `signature` | Publisher signature |

---

## Lifecycle

```mermaid
flowchart LR
  PUB[Publisher Studio] --> PKG[.makpkg]
  PKG --> MKP[Marketplace L7]
  MKP --> BUY[Tenant purchase]
  BUY --> VAL[Validate signature and schema]
  VAL --> INS[Install as draft MMM]
  INS --> REV[Human review]
  REV --> PUBLISH[Publish Engine]
  PUBLISH --> CRB[Tenant CRB update]
```

---

## Publication (ISV)

1. Select scope in Studio Marketplace Publisher  
2. Export envelopes + manifest  
3. Sign with publisher key  
4. Upload to Marketplace catalog  
5. Platform review (optional gate)  

---

## Purchase & licensing

| Entity | Storage |
|--------|---------|
| Listing | Marketplace catalog DB |
| License | `license` MMM object per tenant |
| Entitlement | L1 entitlement service |

Plans: free, subscription, perpetual — enforced at install.

---

## Installation

| Step | Action |
|------|--------|
| 1 | Download `.makpkg` |
| 2 | Verify signature + manifest |
| 3 | Check dependencies (other packages, module_dependency) |
| 4 | Create MMM objects **draft** with `lineage.source=marketplace` |
| 5 | Never in-place mutate existing objects (R-18) |

---

## Updates

| Strategy | Behavior |
|----------|----------|
| Minor semver | Additive objects |
| Major semver | New packageId; migration wizard |
| Pin | Tenant may defer update |

---

## Rollback

Uninstall = archive installed objects + repin CRB to pre-install DefinitionVersion (if snapshot exists).

---

## Validation

Same as Publish C-3→C-6 on envelope set before install commit.

---

*End of document.*
