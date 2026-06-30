# Program 3.14 — Consulting Engine MVP Report

**Status:** Official — Mission complete  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Decision:** D-080  
**Gate:** G312 (20/20)  
**Identity authority:** D-074 (frozen)

---

## Summary

First **Consulting Engine** certified. Consumes Enterprise Memory + Knowledge Graph to produce explainable analyses, improvement plans, and recommendations — tenant-owned, observational, never autonomous.

Pipeline: **Memory → Knowledge Graph → Consulting Engine → BOS / Future Engines**

---

## Implemented

| Layer | Path |
|-------|------|
| Contracts + extension points | `src/intelligence/consulting/engine/consultingEngineContracts.js` |
| Consulting store (documents, recommendations, plans) | `consultingEngineStore.js` |
| Context assembly from Memory + Graph | `consultingContextAssembly.js` |
| Graph → Consulting ingestion | `graphToConsultingIngestion.js` |
| Recommendation + plan builders | `recommendationBuilder.js`, `improvementPlanBuilder.js` |
| Retrieval + summarization | `consultingRetrieval.js`, `consultingSummarization.js` |
| Explainability + lineage + audit | `consultingExplainability.js`, `consultingLineage.js`, `consultingAuditTrail.js` |
| BOS projections | `consultingToBosProjection.js` |
| Engine bridges (Decision/Evolution/Intent) | `consultingToIntelligenceBridges.js` |
| BOS UI | `src/bos/components/ConsultingSections.jsx` |
| Gate G312 | `scripts/gate-enterprise-consulting-engine.mjs` |

---

## Preserved

- D-074, BOS, Memory Engine, Knowledge Graph, Workflow, Intent, Foundation
- No chat, no autonomous execution, no technical consulting UI
- G307/G309/G310/G311 regression green

---

## Validation

| Check | Result |
|-------|--------|
| G312 | ✅ 20/20 |

---

*Program 3.14 complete. Consulting belongs to the enterprise.*
