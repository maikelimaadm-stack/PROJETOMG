# CAPABILITIES-REGISTRY — MAK Platform

**Status:** Living document  
**Last verified:** 2026-06-28 (Mission 0.2)  
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

### CI coverage note

| Gate range | In `verify:governance` / CI | Manual scripts |
|------------|----------------------------|----------------|
| G31–G108 | ✅ | `gate:certification` |
| G109–G136 | ✅ | `gate:governance` (includes SSOT G127–G136) |
| G156–G165 (V13 Layout) | ✅ | `gate:layout-config-engine-v13` |
| G166–G175 (V14 Field) | ✅ | `gate:field-config-engine-v14` |
| G176–G185 (V15 Business boundary) | ❌ | `gate:business-boundary-v15` |
| G186–G206 (V15.1/V15.2 consolidation/visual) | ❌ | `gate:modelobase1-consolidation-v151`, `gate:modelobase1-visual-cert-v152`, `gate:paridade-visual` |
| G207–G217 (V16 Validation) | ✅ | `gate:validation-config-engine-v16` |
| G218–G228 (V17 Formula) | ✅ | `gate:formula-config-engine-v17` |
| G229–G239 (V18 Events) | ✅ | `gate:event-config-engine-v18` |
| G240–G250 (V19 Actions) | ✅ | `gate:action-config-engine-v19` |
| G251–G261 (V20 Workflow) | ✅ | `gate:workflow-config-engine-v20` |
| Aggregate V13–V20 | ✅ | `gate:capabilities` (IFM 1D-1) |
| Functional/Foundation completion | ❌ | `gate:functional-completion`, `gate:foundation-completion` |

TD-013 resolved 2026-06-28.

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

## Platform Capabilities (Future / Planned)

| Capability | Status | % | Notes |
|------------|--------|---|-------|
| **MAK DATA PLATFORM** | Spec approved | 5 | D-012; IFM 1C — see [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) |
| Entity Dictionary | Implemented | 90 | MDP-1 `mdp_entity*` |
| Data Dictionary (full) | Implemented | 85 | MDP-2 `mdp_field*` SSOT |
| Relationship Dictionary | Implemented | 80 | MDP-3 `mdp_relationship*` pilot Empresas |
| Relationship Dictionary | Not started | 0 | MDP-3 |
| Metadata Registry (persisted) | Partial | 30 | Runtime registries only; MDP-4 |
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
