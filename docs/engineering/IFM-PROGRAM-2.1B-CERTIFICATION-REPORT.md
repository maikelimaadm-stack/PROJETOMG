# IFM Program 2.1B — Studio Shell Production Certification Report

**Mission ID:** Program 2.1B  
**Program:** MAK Studio — Studio Shell Production  
**Date:** 2026-06-29  
**Gate:** G287  
**Decision:** D-041

---

## Summary

Program 2.1B transforms the Studio Shell Prototype into a **production shell** with real MDP integrations, JWT auth gate, official Selection Model, Workspace Session contract, localStorage persistence, and CRB-based Preview — without new structural layers.

---

## Deliverables

| Asset | Path |
|-------|------|
| Production Shell | `src/studio/shell/StudioShell.jsx` |
| Auth Gate | `src/studio/shell/StudioAuthGate.jsx` |
| Production Provider | `src/studio/shell/StudioProductionShellProvider.jsx` |
| MDP Client | `src/studio/services/mdpStudioClient.js` |
| Preview CRB Adapter | `src/studio/services/previewCrbAdapter.js` |
| Explorer Adapter | `src/studio/services/mdpExplorerAdapter.js` |
| Persistence | `src/studio/services/studioPersistence.js` |
| Production Adapters | `src/studio/domain/adapters/createProductionDomainAdapters.js` |
| Selection Model | `src/studio/domain/contracts/selectionModel.js` |
| Workspace Session | `src/studio/domain/contracts/workspaceSession.js` |
| Gate G287 | `scripts/gate-studio-shell-production.mjs` |
| Routes | `/studio`, `/studio/:moduleId`, `/studio/:moduleId/:designerId`, `/studio/prototype` |

---

## Validation

| Check | Result |
|-------|--------|
| build | ✅ |
| lint | ✅ |
| verify:governance | ✅ (G287 in gate:capabilities) |
| verify:governance:cycles | ✅ 5/5 |
| G286 (prototype) | ✅ |
| G287 (production) | ✅ 11/11 |
| G279–G284 | ✅ |
| smoke:production | ⚠️ 13/14 (pre-existing index check) |

---

## Certification (10 questions)

| # | Question | Answer |
|---|----------|--------|
| 1 | O Studio Shell tornou-se funcional em produção? | **Sim** — `/studio/empresas/layout` carrega MDP real, auth, persistence |
| 2 | Todos os mocks foram removidos? | **Sim** do caminho de produção; protótipo preservado em `/studio/prototype` |
| 3 | O Selection Model tornou-se padrão oficial? | **Sim** — `selectionModel.js` + `createStudioSelection` em actions |
| 4 | O Workspace Session tornou-se padrão oficial? | **Sim** — `workspaceSession.js` + `SessionSync` no provider |
| 5 | O Studio utiliza exclusivamente APIs públicas? | **Sim** — `mdpStudioClient` via `apiClient` (JWT + tenant) |
| 6 | Build, Lint, CI e Governança permanecem verdes? | **Sim** — build, lint, verify:governance, 5 cycles ✅ |
| 7 | O repositório permanece saudável? | **Sim** — G140 restaurado (paths MDP segmentados) |
| 8 | O Preview utiliza exclusivamente Runtime Bridge? | **Sim** — CRB via `previewCrbAdapter` (paridade introspect/compile, sem import runtimeBridge) |
| 9 | O Studio está pronto para receber o Layout Designer? | **Sim** — shell, domain, contributions, auth, MDP read path prontos |
| 10 | Briefing 2.2 preparado? | **Sim** — [IFM-PHASE-2.1-LAYOUT-STUDIO-BRIEF.md](./IFM-PHASE-2.1-LAYOUT-STUDIO-BRIEF.md) |

---

## Next

**Program 2.2 — Layout Studio (Empresas Pilot)** — first functional designer plugin.

Brief: [IFM-PHASE-2.1-LAYOUT-STUDIO-BRIEF.md](./IFM-PHASE-2.1-LAYOUT-STUDIO-BRIEF.md)

---

*Certified — Program 2.1B complete. Functional implementation era begins with 2.2.*
