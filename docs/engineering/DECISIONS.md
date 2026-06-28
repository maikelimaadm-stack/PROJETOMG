# DECISIONS — Architectural Decision Register

**Status:** Living document  
**Last updated:** 2026-06-28 (Mission 0.2)  
**Format:** D-numbered decisions, immutable once accepted (supersede, don't edit)

---

## D-001 — Foundation Freeze (Enterprise V10)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Foundation (ModeloBase1 + framework/mak + cadastro-engine + generator) is frozen. Evolution only backward-compatible. |
| **Evidence** | `scripts/governance-baseline.json` v10.1.0 |
| **Consequences** | All structural changes require gates + Amendment Process |

---

## D-002 — ModeloBase1 as Structural SSOT

| Field | Value |
|-------|-------|
| **Date** | 2026-06-26 |
| **Status** | Accepted |
| **Decision** | ModeloBase1 owns all structural cadastro UI. Modules are thin config consumers (~10 LOC pages). |
| **Evidence** | Gates G127–G136; `docs/ENTERPRISE_SSOT_CERTIFICATION_REPORT.md` (historical) |
| **Consequences** | No module may implement toolbar/table/form/search/dock |

---

## D-003 — Generator-Only Module Creation

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | New cadastro modules created exclusively via `scripts/generate-cadastro-module.mjs`. |
| **Evidence** | Gates G103–G108 |
| **Consequences** | Manual scaffolding prohibited for certified modules |

---

## D-004 — Config Engines as Capability Pack (V13–V20)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Capabilities implemented as config engines with Map registries per moduleId — not parallel implementations. |
| **Evidence** | Gates G156–G261; `framework/mak/*ConfigEngine*` |
| **Consequences** | New capabilities follow engine + registry + bootstrap + gate pattern |

---

## D-005 — Bootstrap Inversion (Foundation ↔ Domain)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Foundation must not import `modules/*`. Engine registration via `makBootstrap` side-effects. |
| **Evidence** | Gate G109; `src/modules/makBootstrap/` |
| **Consequences** | Domain configs pulled into bootstrap at app start |

---

## D-006 — Grouping Disabled in Certified Table

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Column grouping/pivot removed from certified ModeloBase1. Requires future Capability Pack. |
| **Evidence** | `createMakGroupingEngine.js` → `disabled_certified` |
| **Consequences** | Do not re-enable without V21+ certification |

---

## D-007 — Constitution as Highest Authority

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | `docs/constitution/` is the permanent memory of the platform. Supersedes chat and informal reports. |
| **Evidence** | Mission 0.1 — `docs/constitution/00-MAK-CONSTITUTION.md` |
| **Consequences** | All missions read Constitution first; Amendment Process for changes |

---

## D-008 — Permanent Governance Directive

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Every mission follows 4-perspective analysis + 10-item mandatory certification + engineering doc updates. |
| **Evidence** | `docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md`, `README_AI.md` |
| **Consequences** | No mission complete without certification block |

---

## D-009 — Multi-Tenant Custom JWT (Not Supabase Auth)

| Field | Value |
|-------|-------|
| **Date** | 2026-06 (production) |
| **Status** | Accepted |
| **Decision** | Authentication via custom JWT (Fastify + bcrypt). Supabase used for storage admin, not primary auth. |
| **Evidence** | `backend/src/modules/auth/` |
| **Consequences** | AI Platform must respect existing auth boundaries |

---

## D-010 — CADCPS as Partial Data Dictionary

| Field | Value |
|-------|-------|
| **Date** | 2026-06 |
| **Status** | Accepted |
| **Decision** | CADCPS provides field-level metadata. Full entity catalog is future work — no parallel field metadata tables. |
| **Evidence** | `CadCps*` Prisma models; `CustomFieldEngine.js` |
| **Consequences** | Data Dictionary evolution extends CADCPS pattern |

---

## D-011 — Programa 1 (IFM) Before MAK Studio

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Official next architectural program is **Programa 1 — Integridade e Fundação de Metadados (IFM)**, not MAK Studio. Studio becomes Program 2 after entity catalog + introspection API + stability fixes. |
| **Evidence** | Mission 0.2 GAP analysis (`DOCUMENTATION-CERTIFICATION.md` §3–4); P0 Produto migration; TD-001–TD-003 |
| **Consequences** | Sprint work follows IFM 1A→1D before any Studio UI; roadmap phases relabeled |

---

## Pending Decisions

| Topic | Blocker |
|-------|---------|
| MAK Studio metadata storage | Entity catalog schema (ROADMAP P1) |
| Backend event bus design | Automation Studio requirements |
| Offline sync architecture | Not scheduled |

---

## Superseded

_None yet._

---

*New decisions: add D-011+ with date, status, evidence, consequences. Update [ENGINEERING-JOURNAL.md](./ENGINEERING-JOURNAL.md).*
