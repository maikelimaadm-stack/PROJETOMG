# IFM Mission 1 — Strategic Review

**Program:** 1 — IFM (Integridade e Fundação de Metadados)  
**Mission:** 1 — Revisão da Estratégia do Programa IFM  
**Date:** 2026-06-28  
**Type:** Architectural strategy review — **no code changes**  
**Verdict:** **Reorganization approved** — MAK DATA PLATFORM adopted as official layer

---

## Executive Summary

The IFM program direction (stability before Studio) remains **correct**. The organization is **refined** by naming and structuring an explicit layer:

**MAK DATA PLATFORM (MDP)** — the metadata nucleus of MAK Gestão.

MDP is not a separate program competing with IFM. It is the **formal architectural layer** that IFM Phase 1C builds, and that all future platforms (Studio, IA, Marketplace, Offline, Low-Code) depend on.

---

## Six Technical Evaluations (Required Answers)

### 1. O Programa IFM deve ser reorganizado?

**SIM** — refinamento organizacional, não mudança de direção.

| Before (Mission 0.2) | After (Mission 1) |
|----------------------|-------------------|
| IFM 1C: vague "entity catalog + introspection API" | IFM 1C: **MAK DATA PLATFORM** (4 dictionaries + registry) |
| Metadata foundation implicit | Metadata foundation **explicit and named** |
| IFM 1A/1B unchanged | IFM 1A/1B unchanged — stability and architecture cleanup first |

IFM structure after reorganization:

```
Programa 1 — IFM
├── Phase 1A — Estabilidade (S1–S4)          [unchanged]
├── Phase 1B — Arquitetura (A1–A2)           [unchanged]
├── Phase 1C — MAK DATA PLATFORM (MDP-1→4)   [explicit layer]
├── Phase 1D — Governança (TD-013)           [unchanged]
Programa 2 — MAK Studio                      [depends on MDP]
Programa 3 — Marketplace · IA · Knowledge    [depends on MDP + Studio]
```

---

### 2. A MAK DATA PLATFORM deve existir como programa oficial?

**SIM** — como **camada arquitetural oficial** dentro do Programa 1 IFM, documentada em `docs/engineering/MAK-DATA-PLATFORM.md`.

MDP is **not** Program 2. It is the metadata platform layer that:

- Persists and versions platform definitions (not just executes them)
- Unifies entity, field, and relationship knowledge
- Exposes introspection and mutation APIs for Studio, IA, and Marketplace
- Evolves from existing CADCPS and registry patterns — **no parallel system**

---

### 3. Ela deve anteceder o MAK Studio?

**SIM** — obrigatoriamente.

| Without MDP first | With MDP first |
|-------------------|----------------|
| Studio edits module JS files directly | Studio reads/writes Metadata Registry |
| Each engine keeps isolated metadata | Central registry with typed definitions |
| No versioning of definitions | Versioned publish pipeline possible |
| IA hallucinates schema | IA queries Entity/Field/Relationship Dictionary |
| Marketplace has no package format | Marketplace publishes MDP definition bundles |

Decision **D-011** remains valid; Mission 1 **names and structures** what D-011 called "entity catalog + introspection API".

---

### 4. O Studio dependerá diretamente desta camada?

**SIM** — dependência direta e exclusiva para definições.

```
MAK Studio (UI designers)
        ↓ read/write API
MAK DATA PLATFORM (Metadata Registry + Dictionaries)
        ↓ hydrate / compile
Foundation Runtime (ModeloBase1 + config engines V13–V20)
        ↓ render / execute
Domain Modules + Business Data (Prisma)
```

Foundation **runtime registries** (Map per moduleId at boot) remain in `framework/mak/` — they are **execution caches**, not the SSOT. MDP is the **persisted SSOT** that bootstraps those registries.

Studio must **never** bypass MDP to edit Foundation code or module `*Form.constants.js` directly in production mode.

---

### 5. Existe componente semelhante implementado que possa ser promovido?

**SIM** — significant partial implementations exist. None is sufficient alone; together they seed MDP.

| MDP Component | Existing Code (promotion source) | Maturity | Promotion action |
|---------------|-----------------------------------|----------|------------------|
| **Entity Dictionary** | `config/cadastro-modules.registry.json`; `CadCpsTela.entity_name`; Prisma models per entity; `cadastroModuleRegistry.js` | ~25% | Formalize entity catalog schema; unify registry + DB entities + generator output |
| **Data Dictionary** | CADCPS: `CadCpsCampo`, `CadCpsCampoOpcao`, `CadCpsHistorico`; 18 field types in `cadcpsConstants.js`; `/api/cadastro/:entity/campos`; `CustomFieldEngine.js` | ~45% | Extend from "custom fields only" to **all fields** (native + configurable); absorb module `*Form.constants.js` definitions |
| **Relationship Dictionary** | `CadCpsCampo.relation_entity`, `options_label_field`, `options_value_field`; hardcoded FKs in Prisma | ~15% | New catalog — field-level relation hints exist; no entity-relationship graph |
| **Metadata Registry** | 11 engine Maps (`*ConfigRegistry.js`); per-module `*ModuleMetadata.js`; `UsuarioPreferencia.preferencias_json`; docs catalogs (`EVENT_CATALOG.md`, etc.) | ~30% | Central persisted registry with types: layout, field, event, action, formula, validation, workflow, permission, dashboard, pivot, report, integration |

**Must NOT promote (stay in Foundation):**

- Runtime engine execution (`createMak*ConfigEngine`, `LayoutEngine`, etc.)
- ModeloBase1 UI orchestration
- Bootstrap side-effects (`makBootstrap/*`)

**Promotion principle (Constitution 07):** evolve CADCPS and registries **into** MDP — do not create parallel metadata tables or APIs.

---

### 6. Existe alteração necessária na documentação oficial?

**SIM** — applied in Mission 1:

| Document | Change |
|----------|--------|
| `docs/engineering/MAK-DATA-PLATFORM.md` | **Created** — layer specification |
| `docs/engineering/ROADMAP.md` | IFM 1C reorganized as MDP phases |
| `docs/engineering/DECISIONS.md` | D-012, D-013 added |
| `docs/engineering/CURRENT-STATE.md` | MDP layer status |
| `docs/engineering/CAPABILITIES-REGISTRY.md` | MDP components registered |
| `docs/engineering/NEXT-SPRINT.md` | Mission 1 note; 1A still next for code |
| `docs/engineering/ENGINEERING-JOURNAL.md` | Mission 1 entry |
| `docs/constitution/01-VISION-AND-SCOPE.md` | MDP in platform vision |
| `docs/constitution/02-ARCHITECTURE-PRINCIPLES.md` | MDP layer in architecture |
| `docs/constitution/10-PLATFORM-BOUNDARIES.md` | CADCPS → MDP evolution path |

Constitution **not amended** (no rule changes) — strategic layer documented in engineering docs + vision docs. Full Constitution amendment if MDP introduces new Foundation boundaries (future mission).

---

## Four Perspectives (Permanent Directive)

### Arquitetura

- MDP sits **between** business data (Prisma) and Foundation runtime
- No parallel metadata system — CADCPS evolution path preserved (Constitution 10 §7)
- Foundation frozen — MDP consumes Foundation builders, does not replace them

### Qualidade

- No code changed — documentation only
- Existing gates unaffected
- MDP implementation missions will require new gate suite (future MDP-1 gates)

### Evolução

MDP directly prepares:

| Future platform | How MDP prepares |
|-----------------|------------------|
| MAK Studio | Introspection + mutation API |
| Low-Code | Versioned definition bundles |
| IA | Queryable entity/field/relationship graph |
| Knowledge Platform | Links content to entity definitions |
| Marketplace | Publishable MDP packages |
| Versionamento | Definition versioning in registry |
| Publicação | Compile MDP → module runtime |
| Offline | Syncable definition snapshots |
| Multi-tenant | cliente_id scoped dictionaries (extends CADCPS pattern) |

### Governança

- D-012, D-013 recorded
- ROADMAP, CURRENT-STATE, JOURNAL updated
- IFM 1A (Produto migration) remains first **implementation** mission

---

## Mandatory Certification — Mission 1

| # | Pergunta | Resposta | Justificativa |
|---|----------|----------|---------------|
| 1 | Arquitetura íntegra? | **SIM** | Nenhum código alterado |
| 2 | Constituição válida? | **SIM** | Visão ampliada; regras Foundation intactas |
| 3 | Nova dívida técnica? | **NÃO** | Documentação estratégica apenas |
| 4 | Duplicação estrutural? | **NÃO** | MDP unifica — proíbe paralelismo |
| 5 | Promoção Foundation? | **NÃO** | Promoção CADCPS→MDP é Phase 1C futura |
| 6 | Simplificação? | **SIM** | IFM 1C agora tem estrutura clara |
| 7 | Legado removível? | **NÃO** | N/A |
| 8 | CURRENT-STATE atualizado? | **SIM** | MDP layer referenced |
| 9 | Prepara roadmap? | **SIM** | MDP phases MDP-1→4 defined |
| 10 | Inconsistência doc/código? | **NÃO** | Estratégia future-facing; estado atual unchanged |

---

*Full MDP specification: [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md)*
