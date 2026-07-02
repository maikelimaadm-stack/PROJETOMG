# MAK Platform Architecture — Documentation Hub

**Status:** Official SSOT — Complete platform architecture (implementation frozen)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Foundation Architecture Audit — documentation only  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md) and [Product Identity Freeze](../architecture/MAK-PRODUCT-IDENTITY-FREEZE.md) (D-074); **supersedes layer presentation** in derived docs for implementation sequencing

> **Rule:** No implementation (code, migrations, APIs) proceeds until [19-AUDIT-FINAL.md](./19-AUDIT-FINAL.md) certification and [18-FOUNDATION-ROADMAP.md](./18-FOUNDATION-ROADMAP.md) gate for the target foundation is **PASS**.

---

## Relationship to other SSOT

| Document set | Role |
|--------------|------|
| [docs/meta-model/](../meta-model/) | **MMM foundation** — frozen through Programs 4.01–4.04 |
| [docs/platform-architecture/](./) | **Full platform** — layers, runtime, studio, low-code, security, scale |
| [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) | Historical L0–L7 map — **mapped** in [01-LAYERS.md](./01-LAYERS.md) |
| [DECISIONS.md](./DECISIONS.md) | Platform architecture decisions **D-PA-01+** |

---

## Document index

| # | Document | Owner topic |
|---|----------|-------------|
| 00 | [PLATFORM-OVERVIEW](./00-PLATFORM-OVERVIEW.md) | Vision, products, end-to-end flow |
| 01 | [LAYERS](./01-LAYERS.md) | L0–L10 canonical layer model |
| 02 | [RUNTIME](./02-RUNTIME.md) | Birth, load, execute, CRB, session, cache |
| 03 | [STUDIO](./03-STUDIO.md) | Designers catalog and authoring |
| 04 | [LOW-CODE](./04-LOW-CODE.md) | Zero-code system creation path |
| 05 | [META-MODEL-AUDIT](./05-META-MODEL-AUDIT.md) | MMM gap and consistency audit |
| 06 | [UNIVERSAL-DATA-MODEL](./06-UNIVERSAL-DATA-MODEL.md) | Records, CRUD, events, sync |
| 07 | [RENDER-ENGINE](./07-RENDER-ENGINE.md) | Universal presentation rendering |
| 08 | [ACTION-ENGINE](./08-ACTION-ENGINE.md) | Universal action dispatch |
| 09 | [WORKFLOW-ENGINE](./09-WORKFLOW-ENGINE.md) | Universal workflow host |
| 10 | [AI-ARCHITECTURE](./10-AI-ARCHITECTURE.md) | AI boundaries and Intent pipeline |
| 11 | [BOS](./11-BOS.md) | Business Operating Shell review |
| 12 | [MARKETPLACE](./12-MARKETPLACE.md) | Distribution architecture |
| 13 | [SECURITY](./13-SECURITY.md) | Tenant, RBAC, audit, LGPD |
| 14 | [APIS](./14-APIS.md) | API taxonomy and contracts |
| 15 | [SCALABILITY](./15-SCALABILITY.md) | 100 → 10M tenants architecture |
| 16 | [GAPS-AND-DECISIONS](./16-GAPS-AND-DECISIONS.md) | Closed gap register |
| 17 | [DEPENDENCY-GRAPH](./17-DEPENDENCY-GRAPH.md) | Full dependency graph |
| 18 | [FOUNDATION-ROADMAP](./18-FOUNDATION-ROADMAP.md) | Foundation A→L sequence |
| 19 | [AUDIT-FINAL](./19-AUDIT-FINAL.md) | Certification to resume code |

---

## Cross-cutting

| Document | Purpose |
|----------|---------|
| [DECISIONS.md](./DECISIONS.md) | D-PA-01 through D-PA-25 |
| [CONTRACTS.md](./CONTRACTS.md) | Inter-layer contracts |
| [DIVERGENCE-REGISTER.md](./DIVERGENCE-REGISTER.md) | Platform-level divergences resolved |

---

## Amendment process

1. New **D-PA** entry in [DECISIONS.md](./DECISIONS.md)
2. Update affected topic document(s)
3. Register in [GOVERNANCE-REGISTRY.md](../engineering/GOVERNANCE-REGISTRY.md)
4. Re-run certification in [19-AUDIT-FINAL.md](./19-AUDIT-FINAL.md) if layer topology changes
