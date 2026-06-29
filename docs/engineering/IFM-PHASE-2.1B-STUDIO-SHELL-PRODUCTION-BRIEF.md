# IFM Phase 2.1B — Studio Shell Production Brief

**Mission ID:** IFM Phase 2.1B (Program 2.1B)  
**Program:** MAK Studio — Studio Shell Production  
**Priority:** P1  
**Status:** **Ready after 2.1A prototype validation**  
**Architecture:** [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) v1.5.0  
**UX Framework:** [MAK-STUDIO-UX-FRAMEWORK.md](../architecture/MAK-STUDIO-UX-FRAMEWORK.md) v1.0.0 (**mandatory**)  
**Prototype:** [IFM-PROGRAM-2.1A-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A-CERTIFICATION-REPORT.md) (D-037)  
**Prior brief (superseded scope):** [IFM-PHASE-2.1-STUDIO-SHELL-BRIEF.md](./IFM-PHASE-2.1-STUDIO-SHELL-BRIEF.md)

---

## Objective

Evolve the **2.1A visual prototype** into the **production Studio Shell** — real auth, MDP API clients, session persistence, and ERP integration — while preserving the validated UX layout and decoupled architecture.

**No Layout Studio in this mission.**

---

## Inherit from 2.1A (do not rebuild)

| Asset | Path | Action |
|-------|------|--------|
| Shell layout | `src/studio/shell/StudioShellPrototype.jsx` → rename/refactor to `StudioShell.jsx` | Keep structure |
| Dock manager | `src/studio/dock/StudioDockManager.jsx` | Add persistence |
| Panels | `src/studio/panels/*` | Wire real data |
| Provider | `src/studio/shell/StudioShellProvider.jsx` | Replace mock deps |
| Styles | `studioShellPrototype.css` | Promote to production tokens |
| Gate G286 | Extend or add G287 for production checks |

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
Phase 1 — Provider deps
  MOCK_EXPLORER_TREE → mdpRegistryService.introspect(moduleId)
  MOCK_PROPERTY_SCHEMA → propertyRegistry from MDP compile bundle
  MOCK_COMMANDS → sdk.command from bootstrap + shell commands

Phase 2 — Auth + routing
  Wrap StudioShell in auth gate (reuse ERP auth context)
  Move route inside protected segment OR keep full-screen with token check

Phase 3 — Persistence
  Dock sizes/tabs → localStorage key `mak-studio-dock:{moduleId}`
  Last designer → session storage

Phase 4 — Polish
  NotificationArea consolidation
  Global search index
  Responsive dock collapse (UX §7)
  Loading/error/empty states (UX §4.19–4.20)
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
