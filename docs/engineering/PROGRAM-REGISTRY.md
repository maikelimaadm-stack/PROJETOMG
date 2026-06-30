# Program Registry — Official SSOT

**Status:** Official — All program IDs and dependencies  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5C — Enterprise Architecture Remediation  
**Decision:** D-062  
**Position SSOT:** [PROJECT-STATUS.md](./PROJECT-STATUS.md)

---

## Status legend

| Status | Meaning |
|--------|---------|
| **complete** | Delivered and certified on `main` |
| **complete-docs** | Architecture/docs only |
| **active** | Current or next authorized work |
| **planned** | Authorized future |
| **superseded** | ID retired — see successor |
| **cancelled** | Never delivered; do not restart under old ID |

---

## Program 0 — Documentation OS ✅

| ID | Name | Decision | Status |
|----|------|----------|--------|
| 0.1 | Constitution bootstrap | D-011 area | complete |
| 0.2 | Documentation certification | D-011 | complete |

---

## Program 1 — IFM (Metadata Foundation) ✅

| ID | Name | Decision | Status |
|----|------|----------|--------|
| 1A | Stability | — | complete (partial S4 pending) |
| 1B | Architecture promotion | — | background |
| 1C | MAK DATA PLATFORM (MDP-0→5) | D-012, D-020, D-025, D-026 | **complete — frozen** |
| 1D | CI governance (V13–V20 in CI) | — | complete |
| 1E | Runtime Bridge | D-027, D-030 | Phase 1 complete |
| 1F | Enterprise Readiness | D-028 | complete-docs |

---

## Program 2 — MAK Studio ✅ (frozen foundation)

| ID | Name | Decision | Gate | Status |
|----|------|----------|------|--------|
| 2.0 | Studio foundation architecture | D-031 | — | complete-docs |
| 2.0.5 | Studio SDK | D-032 | G262–G266 | complete |
| 2.0.6 | Design System | D-033 | G267–G271 | complete |
| 2.0.7 | Event Architecture | D-034 | G273–G278 | complete |
| 2.0.8 | Architecture Governance | D-035 | G279–G284 | complete |
| 2.0.9 | UX Framework | D-036 | G285 | complete-docs |
| 2.1A | Shell Prototype | D-037 | G286 | complete |
| 2.1A.5 | Universal Components | D-038 | G288 | complete |
| 2.1A.6 | Domain Engine | D-039 | G289 | complete |
| 2.1A.7 | Contribution Engine | D-040 | G290 | complete |
| 2.1B | Shell Production | D-041 | G287 | complete |
| 2.2 | Layout Studio | D-042 | G291 | complete |
| 2.2.5 | Core Engine | D-043 | G293 | complete |
| 2.2.6 | SOM | D-044 | G294 | complete |
| 2.2.7 | Editor Engine | D-045 | G295 | complete |
| 2.3 | Field Studio | D-046 | G296 | complete |
| 2.3.1 | Smart Authoring | D-047 | G297 | complete |
| 2.3.2 | Expression Engine | D-048 | G298 | complete |
| 2.3.3 | Dependency Engine | D-049 | G299 | complete |
| 2.3.4 | Type System | D-050 | G300 | complete |
| 2.3.5 | Evaluation Engine | D-051 | G301 | complete |
| 2.3.X | Stabilization + freeze | D-052 | G401/G402 deploy | complete |
| 2.3.Y | Transition & continuity | D-053 | — | complete |
| ~~2.3.6~~ | ~~Computation Engine~~ | — | — | **superseded → 3.0.5 + 3.1** |

---

## Program 3 — Studio Intelligence (current track)

| ID | Name | Decision | Status | Next dependency |
|----|------|----------|--------|-----------------|
| 3.0.5 | Studio Computation Architecture | D-054 | complete-docs | — |
| 3.1 | Computation Engine | D-055 | complete (G302) | — |
| 3.2 | Formula Builder | D-056 | complete (G303A) | — |
| 3.1.5 | Enterprise Platform Vision | D-057 | complete-docs | — |
| 3.3 | Business Computation Layer | D-058 | complete-docs | — |
| 3.4 | Business Intent Authoring | D-059 | complete-docs | — |
| 3.5A | Enterprise Intelligence Vision | D-060 | complete-docs | — |
| 3.5B | Architecture Consolidation Audit | D-061 | complete-docs | — |
| **3.5C** | **Architecture Remediation** | **D-062** | **complete-docs** | — |
| **3.6** | **Business Derivation Architecture** | **D-063** | **complete-docs** | — |
| **3.6.5** | **Business Intent Resolver Architecture** | **D-064** | **complete-docs** | — |
| **3.6.8** | **Business Language Architecture** | **D-065** | **complete-docs** | — |
| **3.6.9** | **Enterprise Digital Organization Architecture** | **D-066** | **complete-docs** | — |
| **3.7** | **Business Intent Resolver (Implementation)** | D-067 | **complete (G305)** | — |
| **3.8** | **Business Computed Fields** | D-068 | **complete (G306)** | — |
| **3.8.5** | **Enterprise Vision Compliance Audit** | D-069 | **complete (audit)** | 3.8 ✅ |
| **3.8.6** | **Enterprise Platform Deep Audit** | D-070 | **complete (audit)** | 3.8.5 ✅ |
| **3.9** | **Business Workflow** | D-063 | **active — next** | 3.8.6 ✅ |
| 3.3-impl | Business Computation impl | D-058 | planned | G303B |
| 4.x | Enterprise Memory / Intelligence impl | D-060 | planned | Post Resolver |

> **Note:** "Program 3" in Phase 6 ROADMAP historically meant Marketplace — renamed collision documented in SUPERSESSION-REGISTER. Current **Program 3 = Studio Intelligence**.

---

## Dependency chain (implementation)

```
3.5C Remediation (D-062) ✅
  → 3.6 Business Derivation Architecture (D-063) ✅
    → 3.6.5 Intent Resolver Architecture (D-064) ✅
      → 3.6.8 Business Language Architecture (D-065) ✅
        → 3.6.9 Enterprise Organization Architecture (D-066) ✅
          → 3.7 Intent Resolver Implementation (G305) ✅
            → 3.8 Business Computed Fields (G306) ✅
              → 3.8.5 Enterprise Vision Compliance Audit (D-069) ✅
                → 3.8.6 Enterprise Platform Deep Audit (D-070) ✅
                  → 3.9 Business Workflow ← NEXT
                → 4.x Enterprise Intelligence programs (D-060)
```

---

## Future programs (planned — not started)

| ID | Name | Prerequisite |
|----|------|--------------|
| 4 | AI Platform | Event bus, MDP, Intent platform |
| 5 | Knowledge Platform | MDP, Intent SSOT |
| 6 | Marketplace | MDP bundles, Intent marketplace model |
| 6 | Offline / Sync | MDP snapshots, Sync Platform |

---

*Program position for "next mission" defers to PROJECT-STATUS.md. This registry is the structural SSOT for IDs and dependencies.*
