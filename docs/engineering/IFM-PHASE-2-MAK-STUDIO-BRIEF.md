# IFM Phase 2 — MAK Studio Implementation Brief

**Mission ID:** IFM Phase 2 (Program 2)  
**Program:** MAK Studio  
**Priority:** P1  
**Status:** Prepared — **ready to start** (D-027 + D-030)  
**Prerequisite:** [IFM-1C-MDP-5-CERTIFICATION-REPORT.md](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md) · [IFM-PHASE-1E-CERTIFICATION-REPORT.md](./IFM-PHASE-1E-CERTIFICATION-REPORT.md)  
**Parallel:** [IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md](./IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md)

---

## Prerequisites (Complete)

| Component | Status |
|-----------|--------|
| MDP-1 Entity Dictionary | ✅ Frozen (D-025) |
| MDP-2 Data Dictionary | ✅ Frozen |
| MDP-3 Relationship Dictionary | ✅ Frozen |
| MDP-4 Metadata Registry | ✅ Frozen |
| MDP-5 Publish Engine | ✅ Complete (D-026) |
| Foundation V10.2 | ✅ Frozen |
| Config Engines V13–V20 | ✅ Gate-certified |

---

## Objective

Launch **MAK Studio** — the metadata authoring UI that writes exclusively to MDP layers and publishes through MDP-5.

**First deliverable:** Layout Studio for empresas pilot (V13 Layout Engine).

---

## Scope

### In scope (Phase 2.1)

- Studio shell scaffold (auth, module selector, version badge from environment pin)
- Layout Studio: read/write `mdp_registry_entry` (type: `layout`, `section`, `panel`)
- Draft editing → preview compile (`POST /api/mdp/compile/:moduleId?draft=true`)
- Publish flow via `POST /api/mdp/publish`
- Read unified graph via `GET /api/mdp/introspect`

### Out of scope

- Marketplace packaging UI
- AI agent authoring
- Offline sync client
- Field/Formula/Workflow studios (later sub-phases)

---

## API contracts (ready)

| API | Studio use |
|-----|------------|
| `GET /api/mdp/introspect` | Discovery surface |
| `POST /api/mdp/compile/:moduleId` | Preview CRB |
| `POST /api/mdp/publish` | Production publish |
| `GET /api/mdp/environment-pins` | Show pinned version per env |
| `/api/mdp/registry` CRUD | Write layout definitions |

---

## Acceptance criteria

- [ ] Studio shell loads empresas module metadata from introspect API
- [ ] Layout edits persist to MDP-4 registry (draft status)
- [ ] Preview uses draft compile without publish
- [ ] Publish creates new CRB + updates production pin
- [ ] No parallel metadata storage outside MDP
- [ ] Foundation unchanged — consumes CRB export/cache only

---

## Risks

| Risk | Mitigation |
|------|------------|
| Studio bypasses MDP | Governance gate — no Studio writes outside `/api/mdp/*` |
| Preview ≠ production | Same compile service for draft/publish paths |
| UX complexity | Start with empresas layout panels only |

---

## Platform Core parallel track (D-027)

Platform Core (L3) **does not antecede** MAK Studio. Parallel track after Layout Studio MVP:

- Event bus scaffold (IFM 1B A5)
- Deploy pipeline activation (Program 1E — environment pin → runtime reload)
- RBAC externalization to MDP-4 permission entries

Studio depends on MDP-5 ✅; Runtime Bridge Phase 1 ✅ (`reloadRuntimeBridgeModule` available for publish→live in Phase 1E-2).

---

## Phase 2.1 — Official Mission Briefing (First Studio Mission)

**Mission ID:** IFM Phase 2.1  
**Objective:** Launch MAK Studio shell + Layout Studio for empresas pilot  
**Prerequisites:** MDP-5 ✅ · Runtime Bridge 1E-1 ✅ · Foundation V10.2 frozen ✅

### Deliverables

1. **Studio shell** — auth gate, module selector (empresas), version badge from environment pin
2. **Layout Studio** — CRUD `mdp_registry_entry` types: `layout`, `section`, `panel`
3. **Draft preview** — `POST /api/mdp/compile/:moduleId` (draft=true) + same hydration adapter as production
4. **Publish flow** — `POST /api/mdp/publish` + pin update
5. **Governance gate G144** (proposed) — Studio writes only via `/api/mdp/*`

### API contracts (ready)

| API | Studio use |
|-----|------------|
| `GET /api/mdp/introspect` | Discovery + version badge |
| `GET /api/mdp/environment-pins` | Pinned version per env |
| `/api/mdp/registry` CRUD | Write layout definitions |
| `POST /api/mdp/compile/:moduleId` | Preview CRB |
| `POST /api/mdp/publish` | Production publish |

### Acceptance criteria

- [ ] Studio shell loads empresas metadata from introspect
- [ ] Layout edits persist to MDP-4 registry (draft)
- [ ] Preview uses draft compile without publish
- [ ] Publish creates CRB + updates pin
- [ ] No metadata storage outside MDP
- [ ] Foundation unchanged — consumes CRB via Runtime Bridge only

### Post-publish integration (1E-2)

After publish success, call `reloadRuntimeBridgeModule('empresas')` to activate CRB in running app without full reload.

---

*Prepared by IFM 1C-MDP-5 mission.*
