# Platform Remediation Register — Master SSOT

**Status:** Official — Living register  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Platform Remediation & Product Alignment  
**Decision:** D-073  
**Sources:** Audits 3.8.5, 3.8.6, 3.8.7, Sanitization Cycle 1 (D-071)

---

## 1. Mission state

| Field | Value |
|-------|-------|
| **Phase** | **Remediation & Consolidation** — active |
| **Implementation** | **PAUSED** — no new Programs until remediation gate passes |
| **Vision adjustments VA-01–08** | **Registered** (D-073 Cycle 1) |

---

## 2. Vision adjustments — registration status

| ID | Adjustment | SSOT document | Cycle 1 |
|----|------------|---------------|---------|
| **VA-01** | BOS primary; ModeloBase1 = template | [MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md](../architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md) | ✅ Registered |
| **VA-02** | Expert Mode ≠ Studio designers | [EXPERT-MODE-AND-STUDIO-BOUNDARY.md](./EXPERT-MODE-AND-STUDIO-BOUNDARY.md) | ✅ Registered |
| **VA-03** | Formula Builder platform-only | Same | ✅ Registered |
| **VA-04** | Capability-centric navigation | [NAVIGATION-AND-CAPABILITY-MODEL.md](./NAVIGATION-AND-CAPABILITY-MODEL.md) | ✅ Registered |
| **VA-05** | Legacy sunset criteria | [LEGACY-TRANSITION-REGISTER.md](./LEGACY-TRANSITION-REGISTER.md) | ✅ Registered |
| **VA-06** | Product identity harmonized | [MAK-PRODUCT-IDENTITY.md](../architecture/MAK-PRODUCT-IDENTITY.md) | ✅ Registered |
| **VA-07** | Event bus decision required | DECISIONS Pending + §4 below | ⚠️ Pending D-number |
| **VA-08** | Intelligence → Intent, not chat-only | §5 below | ✅ Policy registered |

---

## 3. Consolidated classification (all audit findings)

| ID | Item | Class | Action Cycle 1 |
|----|------|-------|----------------|
| PARAM-C03 | Capability catalog kinds | ~~BUG~~ | ✅ Fixed D-071 |
| EPDA-P0-01 | expressionSource UI | IMPLEMENTAÇÃO PARCIAL | Documented VA-02/03 |
| EPDA-P0-02 | 3 formula evaluators | DÍVIDA TÉCNICA | LT-04 transition |
| EPDA-P0-03 | 1/N assets | ROADMAP | No action |
| EPDA-P0-04 | Business Language UI | ROADMAP | BOS future |
| EPDA-P0-05 | Intelligence 0% | ROADMAP | VA-07/08 policy |
| EPDA-P0-06 | empresas bypass | TRANSIÇÃO | LT-01 |
| TD-003 | cadastro legacy | TRANSIÇÃO | LT-05 |
| ModeloBase1 face | Product identity | DECISÃO + VA-01 | ✅ SSOT |
| G303A Formula Builder | Certified Studio | DECISÃO ARQUITETURAL | Boundary VA-03 |
| D-066 freeze | Structural arch | DECISÃO ARQUITETURAL | Preserved |
| Module menu home | Navigation | TRANSIÇÃO | LT-06 |

---

## 4. VA-07 — Event bus (pending decision)

**Required before Intelligence product behavior.**

| Field | Requirement |
|-------|-------------|
| **Scope** | Tenant-scoped domain events for Runtime, Workflow, Automation, Memory, Mining |
| **Constraint** | Human approval for mutations; audit trail |
| **Blocks** | Enterprise Memory, Process Mining, Consulting loop as product |
| **Status** | Listed in DECISIONS Pending — **must receive D-number before Intelligence implementation** |

---

## 5. VA-08 — Intelligence output contract

All Intelligence outputs **must**:

1. Materialize as **Intent candidates** or **Improvement Plans** — not chat-only
2. Include **explainability** with evidence links (Memory, Mining)
3. Require **human approval** before Resolver invocation
4. Store outcomes in **Enterprise Memory** (tenant-owned)

Anti-pattern: sidebar chat without Intent/Memory lineage.

---

## 6. Remediation gate (resume implementation)

Implementation resumes when **all** true:

- [x] VA-01–06, VA-08 registered in SSOT
- [ ] VA-07 event bus decision (D-number)
- [ ] BOS shell implementation plan approved (separate from this doc-only cycle)
- [ ] Remediation Cycle 2 doc drift resolved (PMI, AI-STARTUP sync)
- [ ] Certification re-run (vision alignment score ≥ 85/100)

---

## 7. Quality targets (honest limits)

| Dimension | Target | Can reach 10/10 now? |
|-----------|--------|----------------------|
| Architecture vision SSOT | 9/10 | ✅ Cycle 1 |
| Product identity clarity | 9/10 | ✅ Cycle 1 |
| Implementation alignment | 4/10 | **No** — requires BOS UI (future) |
| Runtime alignment | 4/10 | **No** — LT-04 |
| UX alignment | 3/10 | **No** — without UI work |
| Governance/SSOT | 9/10 | ✅ Cycle 1 |

**Why not 10/10 everywhere:** BOS UI and Runtime unification are **implementation**, not documentation. Reaching 10/10 without violating architecture requires **controlled implementation cycles** after remediation gate — not premature code in this mission.

---

*Update each remediation cycle. Do not delete classifications — mark resolved with date + evidence.*
