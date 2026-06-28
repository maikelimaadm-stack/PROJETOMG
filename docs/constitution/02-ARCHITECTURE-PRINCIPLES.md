# 02 — Architecture Principles

**Constitution document:** 02 of 11  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Core Principle: Metadata-Driven Cadastro

Every certified cadastro module is a **configuration bundle** consumed by frozen runtime layers. The module does not implement UI structure; it declares:

- Field definitions and layouts (`*Form.constants.js`)
- Table columns and sort defaults (`*ModuleMetadata.js`)
- Validation schemas (Zod)
- Repository and API bindings (`moduleDefinition.js`)
- Preference adapter keys
- Optional domain hooks (`buildDynamicFields`, `mapRecordToForm`, etc.)

The runtime pipeline:

```
PAG*.jsx (~10 LOC)
  └── ModeloBase1CadastroPage
        └── buildModeloBase1ConfigFromMakModule(makModule, overrides?)
              └── defineMakModule(definition, metadata, extensions, preferencesAdapter)
                    ├── buildMak*ConfigMetadata (V13–V20 engines)
                    ├── repository → API → backend
                    └── cadastroConfig → cadastro-engine
```

---

## 2. Layered Architecture

| Layer | Path | Responsibility | May import |
|-------|------|----------------|------------|
| **Domain module** | `src/modules/{moduleId}/` | Config, metadata, domain rules, repository | ModeloBase1, framework/mak, apis, shared |
| **ModeloBase1** | `src/ModeloBase1/` | Cadastro UI motor, page orchestration, visual SSOT | framework/mak, framework/cadastro-engine, shared |
| **framework/mak** | `src/framework/mak/` | Runtime, metadata builders, config engines, preferences | cadastro-engine, shared — **never `modules/*`** |
| **cadastro-engine** | `src/framework/cadastro-engine/` | Primitives: LayoutEngine, FieldEngine, ValidationEngine, RenderEngine | shared, apis (cadastro fields) |
| **framework/cadastro (legacy)** | `src/framework/cadastro/` | Pre-promotion Emp* configurators — **transitional** | cadastro-engine, shared |
| **shared** | `src/shared/` | Cross-cutting UI, auth, filters, hooks | No domain modules |
| **Backend module** | `backend/src/modules/{moduleId}/` | CRUD, RBAC, persistence | prisma, shared backend utils |
| **Bootstrap** | `src/modules/makBootstrap/` | Side-effect engine registration at app start | modules/* configs (only here) |

**Dependency rule:** Dependencies flow **downward**. Foundation layers must not import domain modules (except via makBootstrap registration pattern).

---

## 3. Single Source of Truth (SSOT)

### Structural SSOT — ModeloBase1

| Responsibility | Owner |
|----------------|-------|
| Toolbar, table, form, search, cards, dock | ModeloBase1 / framework/mak |
| Loading, empty, error states | framework/mak/ux |
| Visual tokens, scope CSS | `ModeloBase1/layout/modeloBase1VisualTokens.js` |
| Preference motor (read/write/sync) | framework/mak/preferences |
| Module-scoped events (`${moduleId}-*`) | framework/mak/events |

### Domain SSOT — Module

| Responsibility | Owner |
|----------------|-------|
| Field/column definitions | `*Form.constants.js`, metadata |
| Business validation rules | Zod schema + optional hooks |
| API/repository contracts | `repositories/*`, `apis/*` |
| RBAC semantics | Backend `cadastroRbac.js` + frontend permissions |
| Export/PDF domain config | Module utils (e.g. empresas) |

### Mask/utils SSOT

Field masks and shared formatters: `framework/cadastro-engine/field/maskUtils.js` — not duplicated in modules.

---

## 4. Config Engines (Capability Pack V13–V20)

Each engine follows the same pattern:

```
createMak*ConfigEngine(moduleConfig)
  → registerMak*ConfigEngine(moduleId, engine)   // Map registry
  → buildMak*ConfigMetadata(...)                 // Declarative output
  → embedded in ModeloBase1 config via factory
```

| Version | Engine | Registry file |
|---------|--------|---------------|
| V13 | Layout Config | `makLayoutConfigRegistry.js` |
| V14 | Field Config | `makFieldConfigRegistry.js` |
| V16 | Validation Config | `makValidationConfigRegistry.js` |
| V17 | Formula Config | `makFormulaConfigRegistry.js` |
| V18 | Events Config | `makEventConfigRegistry.js` |
| V19 | Actions Config | `makActionConfigRegistry.js` |
| V20 | Workflow Config | `makWorkflowConfigRegistry.js` |

Engines **wrap** cadastro-engine primitives — they do not reimplement them in parallel.

Supporting registries: Import, History, Preferences bootstrap/flush.

---

## 5. Runtime Contract

`defineMakModule` + `createMakRuntime` produce a frozen runtime object:

- `moduleId`, `definition`, `metadata`, `labels`
- `listQueryKey`, `defaultPageSize`, `patchListCache`
- `preferences` adapter
- `repository`, `schema`, `cadastroConfig`

Injected to the tree via `MakModuleProvider` / `ModeloBase1Provider`.

---

## 6. Registry-Driven Discovery

| Registry | Path | Purpose |
|----------|------|---------|
| Certified modules | `config/cadastro-modules.registry.json` | SSOT for active cadastro modules |
| Generated routes | `src/modules/generatedModules.json` | App.jsx lazy routes + menu |
| Backend modules (partial) | `backend/config/cadastro-modules.registry.json` | Backend mirror — **must stay in sync** |
| Engine registries | `framework/mak/**/*Registry.js` | Per-moduleId Map instances |

New modules update frontend registry via generator. Backend registration requires explicit route bootstrap.

---

## 7. Multi-Tenant Data Model (Backend)

```
Cliente (tenant)
  ├── Usuario (+ PermissaoEmpresa ↔ Empresa)
  ├── ClienteModulo (feature flags)
  ├── Empresa (multi-empresa within tenant)
  ├── Cadastro entities (Marca, Produto, …)
  └── CADCPS metadata
```

All operational data is scoped by `cliente_id`. Company-scoped resources additionally use `empresa_id` or `X-Empresa-Id` header validation.

Frontend never connects to PostgreSQL directly — all persistence via HTTP API.

---

## 8. Performance Principles

1. **Virtualized listing** — `@tanstack/react-virtual` for table rows and card grids.
2. **Infinite list + patch cache** — React Query with module-scoped keys.
3. **Debounced preference sync** — LayoutPreferencesEngine (~350ms) with conflict detection.
4. **Backend indexes** — Listing and FK indexes in Prisma migrations.
5. **Code splitting** — Lazy-loaded module pages via `import.meta.glob`.

Large monolith components (`MakCadastroTable.jsx`, `ModeloBase1CadastroPage.jsx`) are accepted technical debt — decompose via formal mission, not ad-hoc splits.

---

## 9. Event Model

Frontend lifecycle events are **module-scoped**:

```javascript
getModuleEventName(moduleId, suffix)  // → "{moduleId}-{suffix}"
dispatchModuleEvent(moduleId, suffix, detail)
subscribeModuleEvent(moduleId, suffix, handler)
```

Catalog: `docs/EVENT_CATALOG.md`. Backend has **no domain event bus** today — events are client-side only.

---

## 10. Design System Duality (Known State)

The platform currently uses:

1. **shadcn/Radix** — `src/shared/ui/*` (shell, dialogs, controls)
2. **MG prototype CSS** — `src/styles/mg-prototype.css`, `mg-ui-system.css` (cadastro chrome)

New cadastro structural work uses MG/ModeloBase1 tokens. Do not introduce a third parallel design system.

---

## 11. Architectural Decision Records

Durable decisions belong in repository docs (future Journal mission). Until then:

- Certification reports in `/docs/ENTERPRISE_*` are historical evidence.
- **This Constitution supersedes** informal conclusions from those reports.

When implementing, verify against **code + gates**, not report narratives.

---

*Next: [03-FOUNDATION-RULES.md](./03-FOUNDATION-RULES.md)*
