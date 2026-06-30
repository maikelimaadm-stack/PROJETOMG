# Document Classification — Official Taxonomy

**Status:** Official — All permanent documentation classified  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5C — Enterprise Architecture Remediation  
**Decision:** D-062

---

## Classification definitions

| Class | Binding? | Update rule |
|-------|----------|-------------|
| **SSOT** | Yes — authoritative | Change requires Decision if architectural |
| **Permanent Architecture** | Yes — long-horizon | Amendment process + Decision |
| **Engineering** | Living — operational | Update every mission |
| **Vision** | Directional — not implementation spec | Update with Decision |
| **Reference** | Supporting | Subordinate to SSOT |
| **Historical** | Point-in-time | Append-only; do not delete |
| **Deprecated** | Do not use | Link to successor |
| **Superseded** | Replaced | See SUPERSESSION-REGISTER |

---

## SSOT documents

| Document | Topic |
|----------|-------|
| [PROJECT-STATUS.md](./PROJECT-STATUS.md) | Current position |
| [DECISIONS.md](./DECISIONS.md) | Decision register |
| [GATE-REGISTRY.md](./GATE-REGISTRY.md) | Gate IDs |
| [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md) | Program IDs |
| [SSOT-REGISTRY.md](./SSOT-REGISTRY.md) | Document ownership |
| [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md) | Governance umbrella |
| [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) | Layer topology |
| [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) | Studio architecture |
| [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) | MDP |
| [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | Business authoring |
| [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) | Business derivation |
| [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) | Business Intent Resolver |
| [MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md](../architecture/MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md) | Business Language |
| [MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md](../architecture/MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md) | Enterprise Digital Organization |
| [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) | Business computation |
| [MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md) | Business asset authoring principles |
| [ENTERPRISE-VISION-COMPLIANCE-AUDIT.md](./ENTERPRISE-VISION-COMPLIANCE-AUDIT.md) | Vision compliance audit (3.8.5) |
| [FORMULA-RUNTIME-UNIFICATION-PLAN.md](./FORMULA-RUNTIME-UNIFICATION-PLAN.md) | Formula runtime migration |

---

## Permanent Architecture (`docs/architecture/MAK-*.md`)

All architecture documents with Decision references D-029+ — including D-057 vision pillars, D-058/059 business layer, D-060 intelligence vision (8 docs + EOS Principles), D-054 computation architecture.

**Count:** 25+ documents — indexed in [DOCUMENT-MAP.md](./DOCUMENT-MAP.md).

---

## Engineering (living)

| Document | Class |
|----------|-------|
| CURRENT-STATE.md | Engineering |
| ROADMAP.md | Engineering (derived from PROGRAM-REGISTRY for sequence) |
| ENGINEERING-JOURNAL.md | Engineering (append-only log) |
| DOCUMENT-MAP.md | Engineering (index) |
| TECH-DEBT.md | Engineering |
| ARCHITECTURE-DEBT-REGISTER.md | Engineering |
| CAPABILITIES-REGISTRY.md | Engineering |
| PLATFORM-MATURITY-INDEX.md | Engineering |
| PLATFORM-IMPLEMENTATION-PROTOCOL.md | Permanent Engineering |
| ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md | Historical (audit snapshot 3.5B) |
| ARCHITECTURE-REMEDIATION-REPORT.md | Engineering (3.5C report) |
| ARCHITECTURE-CONSISTENCY-REPORT.md | Historical (audit 3.5B) |
| PROGRAM-SEQUENCE-VALIDATION.md | Reference (audit 3.5B) |

---

## Vision (`docs/vision/`)

| Document | Class |
|----------|-------|
| MAK-2035-PLATFORM-VISION.md | Vision |
| MAK-2040-VISION-BACKLOG.md | Vision |

---

## Historical (certification & audit)

Pattern: `IFM-PROGRAM-*-CERTIFICATION-REPORT.md`, `IFM-1C-*`, `IFM-D028-*`, `DEPLOYMENT-RECOVERY-CERTIFICATION.md`, `ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md`

**Rule:** Historical docs preserve point-in-time truth. Gate ID updates noted via SUPERSESSION-REGISTER when IDs change.

---

## Deprecated

| Document | Reason | Use instead |
|----------|--------|-------------|
| [NEXT-SPRINT.md](./NEXT-SPRINT.md) | MDP-4 era sprint | PROJECT-STATUS |
| [IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md](./IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md) | Program renumbering | Program 3.0.5/3.1 |

---

## Superseded

See [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md) for full list.

---

*Classification assigned per D-062 audit. New documents must declare class in header.*
