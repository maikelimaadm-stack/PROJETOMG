# IFM Phase 2.1 — Studio Shell Brief

**Mission ID:** IFM Phase 2.1 (Program 2.1)  
**Program:** MAK Studio — Studio Shell  
**Priority:** P1  
**Status:** Prepared — **ready to implement**  
**Architecture:** [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) v1.2.0  
**SDK:** Program 2.0.5 ✅ · [Certification](./IFM-PROGRAM-2.0.5-CERTIFICATION-REPORT.md)  
**Design System:** Program 2.0.6 ✅ · [Certification](./IFM-PROGRAM-2.0.6-CERTIFICATION-REPORT.md)  
**Prerequisites:** Runtime Bridge 1E-1 ✅ · MDP-5 ✅

---

## Objective

Implement the **MAK Studio Shell** — the persistent chrome that hosts all future designers — using the **Studio SDK** (`createStudioSdk`), **Design System Foundation** (tokens, manifests), and official registries.

**No Layout Studio in this mission.** Shell + navigation + dock panels + SDK wiring only.

---

## Architecture alignment

| MAK-STUDIO-ARCHITECTURE | Phase 2.1 deliverable |
|-------------------------|----------------------|
| §4 Studio Shell | `StudioShell.jsx`, auth gate, top bar, session provider |
| §5 Navigation | Routes `/studio`, `/studio/:moduleId` |
| §7 Dock System | Left/right/bottom panels (Explorer, Outline, Inspector, Properties, Runtime Console) |
| §31 Studio SDK | Wire `createStudioSdk({ deps })` with MDP client stubs |
| §32 Design System | Bootstrap tokens/themes; panels resolve visual values via Token Registry |
| §31.2 Registries | Panels read Component/Property catalogs — no hardcoded components |

---

## Implementation scope

### In scope

1. `src/studio/shell/` — StudioShell, StudioAuthGate, StudioTopBar, StudioSessionProvider
2. `src/studio/navigation/studioRoutes.jsx` — React Router integration
3. `src/studio/dock/` — StudioDock + empty panel shells (Explorer, Outline, Inspector, Properties, RuntimeConsole)
4. `src/studio/services/` — mdpRegistryClient, mdpCompileClient, mdpPublishClient (API wrappers)
5. Wire SDK: `createStudioSdk({ deps: { fetchRegistryEntries, compileDraft, … } })`
6. Module landing page (empresas selector) + designer picker (no designer mount yet)
7. Environment/version badge from `GET /api/mdp/environment-pins`
8. Gate **G144** — Studio writes only via `/api/mdp/*`

### Out of scope

- Layout Studio designer plugin
- Field / Workflow / Dashboard studios
- Preview iframe (stub panel OK)
- Publish Center full UI (stub OK)
- AI Assistant panel

---

## SDK integration checklist

- [ ] Shell creates single `createStudioSdk()` instance via context
- [ ] Dock panels use `sdk.dock`, `sdk.explorer`, `sdk.selection`
- [ ] Command palette stub uses `sdk.command`
- [ ] History stub uses `sdk.history`
- [ ] Component lookups use `getStudioComponent()` — never inline component defs
- [ ] Property panel reads `listStudioProperties()` for schema hints
- [ ] Visual values resolve via `getDesignToken()` / `resolveTokenValue()` — no hardcoded colors/spacing
- [ ] Component metadata reads `getComponentManifest()` where applicable

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
- [ ] SDK context available to all shell children
- [ ] Explorer loads registry entries via `/api/mdp/registry`
- [ ] No designer canvas implementation
- [ ] No Foundation / ModeloBase1 / MDP backend changes
- [ ] G144 gate passes

---

## File structure (target)

```
src/studio/
├── shell/
│   ├── StudioShell.jsx
│   ├── StudioAuthGate.jsx
│   ├── StudioTopBar.jsx
│   └── StudioSessionProvider.jsx
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

**Program 2.2 — Layout Studio** — first designer plugin using Shell + SDK + Component Registry.

---

*Prepared automatically by Program 2.0.6 certification — D-033.*
