# IFM Phase 2.1 — Layout Studio Brief

> **Sequencing note (D-032):** Layout Studio is **Program 2.2**. Program 2.1 implements the [Studio Shell](./IFM-PHASE-2.1-STUDIO-SHELL-BRIEF.md) first. This brief remains the specification for the first designer plugin.

**Mission ID:** IFM Phase 2.2 (Program 2.2) — *formerly listed as 2.1*  
**Program:** MAK Studio — Layout Studio  
**Priority:** P1  
**Status:** Prepared — **ready to implement**  
**Architecture:** [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) v1.0.0 (D-031)  
**Prerequisites:** MDP-5 ✅ · Runtime Bridge 1E-1 ✅ · Program 2.0 Architecture ✅

---

## Objective

Implement the **first MAK Studio designer plugin** — Layout Studio for the **empresas pilot** — following the shell architecture defined in Program 2.0.

**Scope:** Shell scaffold + Layout designer only. No Field/Workflow/Dashboard studios.

---

## Architecture alignment (Program 2.0)

| Component | Phase 2.1 deliverable |
|-----------|----------------------|
| **Studio Shell** | Auth gate, top bar, module selector (empresas), env/version badge |
| **Navigation** | Routes `/studio`, `/studio/empresas`, `/studio/empresas/layout` |
| **Workspace** | Layout designer plugin mount |
| **Dock Left** | Explorer (layout/section/panel entries) + Outline (hierarchy) |
| **Dock Right** | Inspector (read-only) + Properties (schema-driven payload edit) |
| **Dock Bottom** | Runtime Console (compile messages) |
| **Preview Engine** | Draft compile → shared `buildCrbHydrationPlan()` → isolated preview |
| **Publish Center** | Validate → publish → pin (basic UI) |
| **History** | Session undo for registry CRUD (minimum viable) |
| **Command Palette** | Core navigation + create layout/section/panel |

**Deferred to later phases:** AI Assistant panel, Marketplace, Collaboration, Asset Manager (full), diff preview.

---

## Implementation scope

### In scope

1. `src/studio/` package scaffold per MAK-STUDIO-ARCHITECTURE §4.3
2. Studio Shell + Navigation + Dock (Explorer, Outline, Inspector, Properties, Runtime Console)
3. Layout designer plugin — CRUD `mdp_registry_entry` types: `layout`, `section`, `panel`
4. Properties panel with `LayoutPanelsEditor` for `empresas.layout.main` payload
5. Draft preview via `POST /api/mdp/compile/empresas` (draft=true)
6. Publish flow via `POST /api/mdp/publish` + environment pin read
7. Governance gate **G144** — Studio writes only via `/api/mdp/*`

### Out of scope

- Field Studio, Validation Studio, Workflow Studio
- AI Assistant implementation (architecture only)
- Marketplace install UI
- Collaboration / presence
- Automatic post-publish `reloadRuntimeBridgeModule` (Program 1E-2)

---

## API contracts

| API | Layout Studio use |
|-----|-------------------|
| `GET /api/mdp/introspect?moduleId=empresas` | Shell load + version badge |
| `GET /api/mdp/environment-pins?moduleId=empresas` | Pin display |
| `GET /api/mdp/registry?moduleId=empresas&entryType=layout` | Explorer |
| `POST/PUT/DELETE /api/mdp/registry` | CRUD draft entries |
| `POST /api/mdp/compile/empresas` | Preview Engine |
| `POST /api/mdp/publish` | Publish Center |

---

## Acceptance criteria

- [ ] Studio shell loads at `/studio/empresas/layout` with auth
- [ ] Explorer lists layout/section/panel registry entries for empresas
- [ ] Properties panel edits payload; saves via registry API
- [ ] Outline shows layout hierarchy; selection syncs with Explorer
- [ ] Preview renders empresas form via draft CRB + hydration adapter
- [ ] Publish creates CRB; version badge updates
- [ ] No metadata writes outside `/api/mdp/*`
- [ ] No Foundation / ModeloBase1 / MDP backend changes
- [ ] G144 gate passes

---

## File structure (target)

```
src/studio/
├── shell/
│   ├── StudioShell.jsx
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
├── workspace/
│   └── StudioWorkspace.jsx
├── designers/
│   └── layout/
│       ├── LayoutDesignerPlugin.jsx
│       ├── LayoutPanelsEditor.jsx
│       └── registerLayoutDesigner.js
├── services/
│   ├── mdpRegistryClient.js
│   ├── mdpCompileClient.js
│   └── mdpPublishClient.js
├── preview/
│   └── StudioPreviewEngine.jsx
├── publish/
│   └── PublishCenterPanel.jsx
└── index.js
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| Studio bypasses MDP | G144 gate; mdp*Client only |
| Preview ≠ production | Same compile API + `buildCrbHydrationPlan()` |
| Shell complexity | Phase 2.1 minimal dock; defer AI/Marketplace |
| Foundation coupling | `src/studio/` isolation; preview in iframe |

---

## Validation

```bash
npm run build
npm run lint
npm run verify:ci
npm run verify:governance
```

Plus manual smoke: open `/studio/empresas/layout`, edit panel, preview, publish.

---

*Prepared automatically by Program 2.0 certification — D-031.*
