# IFM Phase 2.1B — Studio Shell Production Brief

**Mission ID:** IFM Phase 2.1B (Program 2.1B)  
**Program:** MAK Studio — Studio Shell Production  
**Priority:** P1  
**Status:** **Ready — Studio foundation closed (2.1A.7)**  
**Architecture:** [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) v1.8.0 (**foundation closed**)  
**UX Framework:** [MAK-STUDIO-UX-FRAMEWORK.md](../architecture/MAK-STUDIO-UX-FRAMEWORK.md) v1.0.0 (**mandatory**)  
**Prototype:** [IFM-PROGRAM-2.1A-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A-CERTIFICATION-REPORT.md) (D-037)  
**Universal Components:** [IFM-PROGRAM-2.1A.5-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A.5-CERTIFICATION-REPORT.md) (D-038)  
**Contribution Engine:** [IFM-PROGRAM-2.1A.7-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A.7-CERTIFICATION-REPORT.md) (D-040)

> **Foundation closed.** Program 2.1B begins the **functional implementation era**. No new structural layers unless critical architectural risk is discovered.  
**Prior brief (superseded scope):** [IFM-PHASE-2.1-STUDIO-SHELL-BRIEF.md](./IFM-PHASE-2.1-STUDIO-SHELL-BRIEF.md)

---

## Objective

Evolve the **2.1A visual prototype** into the **production Studio Shell** — real auth, MDP API clients, session persistence, and ERP integration — while preserving the validated UX layout and decoupled architecture.

**No Layout Studio in this mission.**

---

## Inherit from 2.1A–2.1A.6 (do not rebuild)

| Asset | Path | Action |
|-------|------|--------|
| Shell layout | `src/studio/shell/StudioShellPrototype.jsx` | Keep structure |
| Universal components | `src/studio/components/` | No changes |
| **Studio Domain** | `src/studio/domain/` | **Swap mock adapters → MDP adapters** |
| Domain bridge | `domain/providers/StudioUniversalBridge.jsx` | Keep — auto-wires Providers |
| Shell provider | `src/studio/shell/StudioShellProvider.jsx` | Auth + production service adapters only |
| Gate G286 + G288 + G289 | Extend with **G287** for production |

---

## Production scope

### In scope

1. **Auth gate** — JWT from Platform Core; redirect if expired (Architecture §4)
2. **Session provider** — tenant (`cliente_id`), module scope, designer context
3. **MDP API clients** — `src/studio/services/` for registry introspect, compile read-only
4. **Explorer** — real tree from MDP Metadata Registry (read-only)
5. **Property Grid** — schema from MDP; `property.changed` → event only (no writes yet)
6. **Command Palette** — real commands from SDK registry + navigation
7. **History / Preview stubs** — Event Hub wiring; Preview bottom dock with compile API read
8. **Dock persistence** — UX §8 localStorage/session key per module
9. **Status Bar** — connection state, validation count from events
10. **Notification area** — consolidate `StudioNotificationArea` in Top Bar
11. **Global search** — index over explorer entries + commands
12. **Routes** — `/studio`, `/studio/:moduleId`, `/studio/:moduleId/:designerId`
13. **Gate G144** — MDP writes via official APIs only (when mutations added)
14. **Gate G287** (new) — production shell: auth wired, no mock imports in provider

### Out of scope

- Layout Studio (2.2) · Field/Workflow/Dashboard studios · Full Preview iframe · Publish Center UI · AI panel · Collaboration · MDP mutations from Property Grid

---

## Migration plan (prototype → production)

```
Phase 1 — Domain service adapters
  createMockDomainServiceAdapters() → createProductionDomainAdapters(mdpClients)
  MOCK_EXPLORER_TREE → domain.actions.workspace.setExplorerTree(mdpTree)
  MOCK_PROPERTY_SCHEMA → domain.actions.properties.setFields(mdpSchema)

Phase 2 — Auth + routing
  Wrap StudioDomainProvider in auth gate (reuse ERP auth context)

Phase 3 — Persistence
  Domain middleware: localStorage sync for dock/tabs slices

Phase 4 — Polish
  SearchService adapter → real index
  ValidationService → MDP compile validation count in StatusBar
```

---

## UX compliance checklist (mandatory)

- [ ] Property Grid (official term) per UX §4.5
- [ ] Global shortcuts §5.3 — no designer overrides
- [ ] Official nomenclature §5.7
- [ ] WCAG 2.1 AA §6 — focus rings, keyboard navigation
- [ ] Toast/banner/dialog patterns §4.17–4.18
- [ ] Selection via `sdk.selection` §4.21
- [ ] `npm run gate:studio-ux` passes
- [ ] G279–G284 green on every commit

---

## Acceptance criteria

- [ ] `/studio` requires valid JWT; unauthenticated → login
- [ ] Explorer loads real MDP tree for `empresas` module
- [ ] Property Grid reflects selected entry schema (read-only)
- [ ] Command Palette executes registered commands
- [ ] Dock layout persists across reload
- [ ] No direct `ModeloBase1` or Prisma imports in shell
- [ ] build · lint · verify:ci · 5 cycles green
- [ ] G286 (prototype) + G287 (production) pass

---

## Dependencies

| Dependency | Status |
|------------|--------|
| Studio SDK (2.0.5) | ✅ |
| Design System (2.0.6) | ✅ |
| Event Architecture (2.0.7) | ✅ |
| Governance (2.0.8) | ✅ |
| UX Framework (2.0.9) | ✅ |
| Shell Prototype (2.1A) | ✅ D-037 |
| MDP-5 publish/read APIs | ✅ |
| Runtime Bridge 1E-1 | ✅ (hydration only; full reload 1E-2 optional) |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Mock → real data shape mismatch | Adapter layer in `src/studio/services/adapters/` |
| Auth full-screen vs ERP layout | Decision in 2.1B kickoff — recommend full-screen with shared token |
| Property Grid write temptation | Read-only flag until Layout Studio (2.2) |

---

*Definitive brief — Program 2.1A certification (D-037). Begin after visual validation of prototype.*
