# CAPABILITIES-REGISTRY — MAK Platform

**Status:** Living document  
**Last verified:** 2026-06-28  
**Source:** Code + gates G156–G261

---

## Registry Legend

| Status | Meaning |
|--------|---------|
| **Complete** | Engine + registry + bootstrap + gates pass + runtime integration |
| **Partial** | Engine exists; limited runtime or no Studio UI |
| **Disabled** | Intentionally off in certified ModeloBase1 |
| **Not started** | No code |

| Certified | Gate suite passes |
| Congelada | Foundation frozen — backward-compatible only |
| Pronta prod. | Used by 4 runtime modules in production architecture |

---

## Config Engines (Capability Pack)

| Capability | Ver | Status | % | Core path | Certified | Congelada | Pronta prod. |
|------------|-----|--------|---|-----------|-----------|-----------|--------------|
| Layout Config Engine | V13 | Complete | 90 | `framework/mak/layoutConfig/` | ✅ G156–G165 | ✅ | ✅ |
| Field Config Engine | V14 | Complete | 85 | `framework/mak/fieldConfig/` | ✅ G166–G175 | ✅ | ✅ |
| Validation Config Engine | V16 | Complete | 80 | `framework/mak/validation/` | ✅ G207–G217 | ✅ | ✅ |
| Formula Config Engine | V17 | Complete | 75 | `framework/mak/formula/` | ✅ G218–G228 | ✅ | ⚠️ Catalog limited |
| Events Config Engine | V18 | Complete | 70 | `framework/mak/events/` | ✅ G229–G239 | ✅ | ⚠️ Client-side only |
| Actions Config Engine | V19 | Complete | 70 | `framework/mak/actions/` | ✅ G240–G250 | ✅ | ⚠️ Client-side only |
| Workflow Config Engine | V20 | Complete | 65 | `framework/mak/workflow/` | ✅ G251–G261 | ✅ | ⚠️ Builtin steps only |

**Percent estimates:** engine + registry + bootstrap + 4/4 module integration + absence of Studio UI.

---

## Foundation Engines

| Capability | Status | % | Registry | Pronta prod. |
|------------|--------|---|----------|--------------|
| Preferences motor | Complete | 85 | `bootstrapRegistry.js`, `makPreferencesFlushRegistry.js` | ✅ |
| Import | Complete | 80 | `makImportRegistry.js` | ✅ |
| History | Complete | 75 | `makHistoryRegistry.js` | ✅ |
| Listing filter sync | Partial | 60 | `syncPanelColumnFilters.js` | ✅ |
| Grouping / Pivot | Disabled | 0 | `createMakGroupingEngine.js` | ❌ |

---

## Certification Modules (Metadata-Only)

Not runtime — prove engine contracts:

| Module | Engine |
|--------|--------|
| fieldcert | V14 |
| validationcert | V16 |
| formulacert | V17 |
| eventscert | V18 |
| actionscert | V19 |
| workflowcert | V20 |

---

## Platform Capabilities (Future)

| Capability | Status | % | Notes |
|------------|--------|---|-------|
| Data Dictionary (full) | Partial | 40 | CADCPS field metadata only |
| MAK Studio | Not started | 0 | No code |
| Marketplace | Not started | 5 | `ClienteModulo` flags only |
| Knowledge Platform | Not started | 0 | — |
| AI Platform | Not started | 0 | — |
| Versionamento (entities) | Partial | 20 | `versao_schema` prefs only |
| Offline / Sync | Partial | 15 | localStorage prefs; no outbox |
| Multi-tenant | Complete | 85 | cliente_id + RBAC + module guard |

---

## Dependencies (Cross-Cutting)

| Capability | Depends on |
|------------|------------|
| All config engines | cadastro-engine, makBootstrap, ModeloBase1 factory |
| Custom fields | CADCPS backend + `CustomFieldEngine.js` |
| Preferences | Backend `UsuarioPreferencia` + LayoutPreferencesEngine |
| Layout configurator | `framework/cadastro/` configurators (legacy UI — promotion target) |

---

## Catalog References

| Engine | Catalog doc |
|--------|-------------|
| Layout | `docs/LAYOUT_CONFIG_ENGINE_INVENTORY.md` |
| Field | `docs/FIELD_CONFIG_ENGINE_INVENTORY.md` |
| Formula | `docs/FORMULA_FUNCTION_CATALOG.md` |
| Events | `docs/EVENT_CATALOG.md` |
| Actions | `docs/ACTION_CATALOG.md` |
| Workflow | `docs/WORKFLOW_CATALOG.md` |

---

## Update Protocol

Update when: new engine (V21+), gate certification, capability status change, or module integration change.

---

*Rules: [03-FOUNDATION-RULES.md](../constitution/03-FOUNDATION-RULES.md) · [06-GOVERNANCE-AND-GATES.md](../constitution/06-GOVERNANCE-AND-GATES.md)*
