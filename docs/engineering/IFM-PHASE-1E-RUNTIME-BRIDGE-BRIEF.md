# IFM Phase 1E — Runtime Bridge Brief

**Mission ID:** IFM Phase 1E (Program 1E)  
**Program:** Runtime Bridge — L4→L2 integration  
**Priority:** P1 — **parallel co-requisite** with MAK Studio Phase 2.1  
**Status:** Prepared — approved by D-027  
**Prerequisite:** [IFM-1C-MDP-5-CERTIFICATION-REPORT.md](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md)

---

## Purpose

Close the **last IFM 1C transitional gap**: Foundation engine registries (`*ConfigRegistry.js`) still hydrate from boot-time module JS (`*ModuleMetadata.js`, `cadastro-modules.registry.json`). MDP-5 produces immutable CRBs — but production runtime does not yet consume them.

This is **not** a new Platform Core platform. It is the **compile output activation path** defined in Master Architecture §4 boot flow and MDP-4.5 review item T-02.

---

## Objective

Wire **empresas pilot** to load layout/field/validation configs: **CRB → engine registries → ModeloBase1 factory**, driven by `mdp_environment_pin` for the active environment.

---

## Scope

### In scope

- CRB fetch: resolve pinned version via `GET /api/mdp/environment-pins` or `config/mdp-compiled-bundle.export.json` fallback
- Hydration adapter: map CRB registry entries → V13–V20 registry shapes (empresas module only)
- Deploy activation hook: on publish success, invalidate/reload boot cache for pinned module
- Governance gate **G143** (proposed): CRB hydration smoke for empresas

### Out of scope

- Full legacy `framework/cadastro/` removal (IFM 1B A1)
- Event bus, job queue, scheduler (IFM 1B A5 — post Studio Layout MVP)
- Marketplace package loader
- Multi-template runtime switching beyond `modelobase1`

---

## Dependencies

| Component | Status |
|-----------|--------|
| MDP-5 compile service | ✅ `backend/src/modules/mdp/mdpCompileService.js` |
| Environment pins | ✅ `mdp_environment_pin` |
| CRB export | ✅ `config/mdp-compiled-bundle.export.json` |
| Foundation registries | ✅ `src/framework/mak/*ConfigRegistry.js` |
| MAK Studio draft compile | Uses same path — Studio Phase 2.1 |

---

## Acceptance criteria

- [ ] Empresas module loads layout config from CRB when pin exists
- [ ] Fallback to existing boot cache when no pin / offline dev
- [ ] Preview (draft compile) and production (published CRB) use identical hydration adapter
- [ ] No Foundation code changes to engines — adapter only in bootstrap layer
- [ ] G143 gate passes in CI

---

## Sequencing with MAK Studio

| Track | Deliverable | Dependency |
|-------|-------------|--------------|
| Studio 2.1 | Layout authoring UI | MDP APIs (ready) |
| Runtime Bridge 1E | CRB → registries | MDP-5 (ready) |

**Both may start in parallel.** Studio without 1E can author/publish but production app won't reflect publishes until 1E lands. **Target: 1E complete before or with Studio 2.1 GA.**

---

*Approved by Platform Architecture Reassessment — D-027.*
