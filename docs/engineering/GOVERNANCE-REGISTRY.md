# Governance Registry — Official Umbrella

**Status:** Official — Master index for platform governance artifacts  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5C — Enterprise Architecture Remediation  
**Decision:** D-062

> **Permanent rule (D-062):** Every Decision (D-xxx), Gate (G-xxx), Program, and SSOT document must be registered in the corresponding registry **before** merge to `main`.

---

## Registry map

| Registry | SSOT for | Path |
|----------|----------|------|
| **Gate Registry** | All Gate IDs, scripts, status | [GATE-REGISTRY.md](./GATE-REGISTRY.md) |
| **SSOT Registry** | Document ownership (one owner per topic) | [SSOT-REGISTRY.md](./SSOT-REGISTRY.md) |
| **Program Registry** | Program IDs, sequence, dependencies | [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md) |
| **Supersession Register** | Superseded decisions, docs, gates, programs | [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md) |
| **Document Classification** | Permanent / Vision / Historical / Deprecated | [DOCUMENT-CLASSIFICATION.md](./DOCUMENT-CLASSIFICATION.md) |
| **Decision Register** | Architectural decisions D-001+ | [DECISIONS.md](./DECISIONS.md) |
| **Architecture Debt Register** | Discovered debt (P0–P3) | [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md) |
| **Tech Debt Register** | Code-level debt | [TECH-DEBT.md](./TECH-DEBT.md) |

---

## Governance layers

```
L0 Constitution          → docs/constitution/
L1 Master Architecture   → docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md
L2 Engineering Principles → MAK-ENGINEERING-PRINCIPLES.md
L3 Specifications        → MDP spec, Studio arch
L4 Engineering OS        → PROJECT-STATUS (position SSOT) + registries (this file)
L5 Programs              → PROGRAM-REGISTRY.md
L6 Implementation        → scripts/gate-*.mjs, src/
```

---

## Mandatory registration workflow

| Artifact | Register in | Also update |
|----------|-------------|-------------|
| New Decision D-xxx | `DECISIONS.md` | `ENGINEERING-JOURNAL.md`, `PROJECT-STATUS.md` if position changes |
| New Gate G-xxx | `GATE-REGISTRY.md` | `scripts/gate-*.mjs`, `package.json` if npm script |
| New Program | `PROGRAM-REGISTRY.md` | `PROJECT-STATUS.md`, `ROADMAP.md` (factual sync only) |
| Supersession | `SUPERSESSION-REGISTER.md` | Original doc header + `DECISIONS.md` § Superseded |
| New architecture doc | `DOCUMENT-CLASSIFICATION.md` + `DOCUMENT-MAP.md` | `SSOT-REGISTRY.md` if SSOT |

---

## Validation commands

| Check | Command |
|-------|---------|
| Build | `npm run build` |
| Lint | `npm run lint` |
| Governance | `npm run verify:governance` |
| CI mirror | `npm run verify:ci` |
| Stability cycles | `npm run verify:governance:cycles` |

---

## Platform consolidation status

| Field | Value |
|-------|-------|
| **Consolidation mission** | Program 3.5C — D-062 |
| **Prior audit** | Program 3.5B — D-061 |
| **State after 3.5C** | **ARCHITECTURE CONSOLIDATED** |
| **Next implementation** | **Program 3.19+** — Segmentation live (D-084, G316) |

---

*This file is the entry point for all governance registries. Do not duplicate gate or program tables elsewhere — link here.*
