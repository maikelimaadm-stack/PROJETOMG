# IFM Phase 2 — MAK Studio Implementation Brief

**Mission ID:** IFM Phase 2 (Program 2)  
**Program:** MAK Studio  
**Priority:** P1  
**Status:** Prepared — ready after MDP-5 / IFM 1C completion  
**Prerequisite:** [IFM-1C-MDP-5-CERTIFICATION-REPORT.md](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md)

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

## Platform Core parallel track

Platform Core (L3) may proceed in parallel for:
- Event bus scaffold
- Deploy pipeline activation (environment pin → runtime reload)
- RBAC externalization to MDP-4 permission entries

Studio depends on MDP-5; Platform Core deploy depends on both.

---

*Prepared by IFM 1C-MDP-5 mission.*
