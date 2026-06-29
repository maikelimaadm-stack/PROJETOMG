# IFM Phase 2.1 — Studio Shell Brief

**Mission ID:** IFM Phase 2.1 (Program 2.1)  
**Program:** MAK Studio — Studio Shell  
**Priority:** P1  
**Status:** Prepared — **ready to implement**  
**Architecture:** [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) v1.4.0  
**SDK:** Program 2.0.5 ✅ · **Design System:** 2.0.6 ✅ · **Events:** 2.0.7 ✅ · **Governance:** 2.0.8 ✅  
**Prerequisites:** Runtime Bridge 1E-1 ✅ · MDP-5 ✅ · **Foundation permanently closed (2.0.8)**

---

## Objective

Implement the **MAK Studio Shell** — the persistent chrome that hosts all future designers — using the three permanent foundation pillars:

1. **Studio SDK** (`createStudioSdk`)
2. **Design System Foundation** (tokens, manifests)
3. **Studio Event Architecture** (`getStudioEventHub`)
4. **Architecture Governance** (`validateStudioArchitecture` — must pass G279–G284)

**No Layout Studio in this mission.** Shell + navigation + dock panels + SDK/Event wiring only.

---

## Architecture alignment

| MAK-STUDIO-ARCHITECTURE | Phase 2.1 deliverable |
|-------------------------|----------------------|
| §4 Studio Shell | `StudioShell.jsx`, auth gate, top bar, session provider |
| §5 Navigation | Routes `/studio`, `/studio/:moduleId` |
| §7 Dock System | Left/right/bottom panels (Explorer, Outline, Inspector, Properties, Runtime Console) |
| §31 Studio SDK | Wire `createStudioSdk({ deps })` with MDP client stubs |
| §32 Design System | Bootstrap tokens/themes; panels resolve visual values via Token Registry |
| §33 Event Architecture | Wire `getStudioEventHub()` — all panel communication via events |
| §34 Governance | All Shell code must pass G279–G284 on every commit |

---

## Implementation scope

### In scope

1. `src/studio/shell/` — StudioShell, StudioAuthGate, StudioTopBar, StudioSessionProvider
2. `src/studio/navigation/studioRoutes.jsx` — React Router integration
3. `src/studio/dock/` — StudioDock + empty panel shells (Explorer, Outline, Inspector, Properties, RuntimeConsole)
4. `src/studio/services/` — mdpRegistryClient, mdpCompileClient, mdpPublishClient (API wrappers)
5. Wire SDK: `createStudioSdk({ deps: { fetchRegistryEntries, compileDraft, … } })`
6. Wire Event Hub: `getStudioEventHub()` via context; panels publish/subscribe — **no direct cross-panel calls**
7. Wire History/Preview via `wireHistoryToEventHub()` / `wirePreviewToEventHub()`
8. Module landing page (empresas selector) + designer picker (no designer mount yet)
9. Environment/version badge from `GET /api/mdp/environment-pins`
10. Gate **G144** — Studio writes only via `/api/mdp/*`

### Out of scope

- Layout Studio designer plugin
- Field / Workflow / Dashboard studios
- Preview iframe (stub panel OK)
- Publish Center full UI (stub OK)
- AI Assistant panel
- Backend Event Bus
- Collaboration / realtime sync

---

## Foundation integration checklist

### SDK

- [ ] Shell creates single `createStudioSdk()` instance via context
- [ ] Dock panels use `sdk.dock`, `sdk.explorer`, `sdk.selection`
- [ ] Command palette stub uses `sdk.command`
- [ ] Component lookups use `getStudioComponent()` — never inline component defs
- [ ] Property panel reads `listStudioProperties()` for schema hints

### Design System

- [ ] Visual values resolve via `getDesignToken()` / `resolveTokenValue()` — no hardcoded colors/spacing
- [ ] Component metadata reads `getComponentManifest()` where applicable

### Event Architecture

- [ ] Shell provides `getStudioEventHub()` via React context
- [ ] Explorer publishes `selection.changed` — Inspector/Properties subscribe
- [ ] Dock publishes `dock.changed` — Shell subscribes
- [ ] Shell publishes `workspace.changed` and `designer.active.changed`
- [ ] History wired via `wireHistoryToEventHub(hub, sdk.history)`
- [ ] Preview stub wired via `wirePreviewToEventHub(hub, sdk.preview)`
- [ ] **No direct imports between Explorer ↔ Inspector ↔ Preview ↔ History**

---

## Routes

| Route | Surface |
|-------|---------|
| `/studio` | Module picker |
| `/studio/:moduleId` | Designer picker (layout/field/… disabled except navigation) |
| `/studio/:moduleId/publish` | Publish Center stub |

---

## Acceptance criteria

- [ ] `/studio` loads with auth gate
- [ ] empresas module selectable; version badge from environment pin
- [ ] Dock panels render (empty state OK)
- [ ] SDK + Event Hub context available to all shell children
- [ ] Explorer loads registry entries via `/api/mdp/registry`
- [ ] Selection change propagates via `selection.changed` event (not direct state sharing)
- [ ] No designer canvas implementation
- [ ] No Foundation / ModeloBase1 / MDP backend changes
- [ ] **No governance violations** — `npm run gate:studio-governance` passes

---

## File structure (target)

```
src/studio/
├── shell/
│   ├── StudioShell.jsx
│   ├── StudioAuthGate.jsx
│   ├── StudioTopBar.jsx
│   ├── StudioSessionProvider.jsx
│   └── StudioEventProvider.jsx      ← Event Hub context
├── navigation/
│   └── studioRoutes.jsx
├── dock/
│   ├── StudioDock.jsx
│   ├── ExplorerPanel.jsx
│   ├── OutlinePanel.jsx
│   ├── InspectorPanel.jsx
│   ├── PropertiesPanel.jsx
│   └── RuntimeConsolePanel.jsx
├── services/
│   ├── mdpRegistryClient.js
│   ├── mdpCompileClient.js
│   └── mdpPublishClient.js
└── pages/
    ├── StudioHomePage.jsx
    └── StudioModulePage.jsx
```

---

## Next mission after 2.1

**Program 2.2 — Layout Studio** — first designer plugin using Shell + SDK + Event Hub + Component Registry.

---

*Prepared automatically by Program 2.0.8 certification — D-035. Foundation permanently closed — begin Studio Shell.*
