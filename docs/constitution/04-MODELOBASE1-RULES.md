# 04 — ModeloBase1 Rules

**Constitution document:** 04 of 11  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Definition

**ModeloBase1** (`src/ModeloBase1/`) is the reusable cadastro UI motor — the structural Single Source of Truth for all certified list+form+search screens.

It orchestrates:

- Page lifecycle (list, create, edit, view, delete, export)
- Panel layout (table, form, search/cards, dock)
- Infinite data loading and selection
- Preference bootstrap and flush
- Integration with all V13–V20 config engine metadata

Entry point: `ModeloBase1CadastroPage` — receives a **frozen config** from `buildModeloBase1ConfigFromMakModule`.

---

## 2. Thin Page Rule

Every certified module page **must** follow this pattern (~10 lines):

```jsx
import React, { memo } from "react";
import ModeloBase1CadastroPage from "@/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
import { {moduleId}ModeloBase1Config } from "@/modules/{moduleId}/config/{moduleId}ModeloBase1Config.js";

function PAG{CODE}() {
  return <ModeloBase1CadastroPage config={{moduleId}ModeloBase1Config} />;
}

export default memo(PAG{CODE});
```

### Prohibited in module pages

- Custom toolbar, table, form, search panel components
- Structural hooks (`use*Toolbar`, `use*Table`, `use*Form`, `use*Search`)
- Imports from `SankhyaListToolbar`, `EmpListToolbar`, `EmpSplitToolbarLayout`
- Pages exceeding ~25 LOC without using ModeloBase1 (gate enforced)

---

## 3. Config Factory

### Minimal module (reference: marcas, produtos)

```javascript
import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { marcasMakModule } from "./marcasMakModule.js";

export const marcasModeloBase1Config = buildModeloBase1ConfigFromMakModule(marcasMakModule, {
  scopeCssClass: buildModeloBase1ScopeCssClass("marcas"),
  tableKey: "tbl-marcas",
});
```

### Reference module (empresas)

May pass extended `overrides` to the factory:

- Custom toolbar components
- Export configuration
- Scope auth (multi-empresa selector)
- Domain-specific preference adapters
- Custom metrics keys

**Rule:** Overrides configure behavior — they do not replace structural components.

### Factory output includes

- Labels, searchView, helpers, hooks (infinite list, favorites, view mode, prefs bootstrap)
- All `*EngineMetadata` objects (layout, field, validation, formula, event, action, workflow)
- Default toolbar components from `buildModeloBase1ToolbarComponents.js`

---

## 4. Visual SSOT

| Asset | File |
|-------|------|
| Visual tokens | `layout/modeloBase1VisualTokens.js` |
| Scope CSS class | `layout/modeloBase1ScopeCss.js` |
| Master scope | `cadastro-emp-scope mg-empresas-scope` (legacy naming — cosmetic debt) |

All certified modules call `buildModeloBase1ScopeCssClass(moduleId)` for consistent chrome.

**Known debt:** Visual reference and CSS scopes still reference "Empresas" nomenclature. New work must use generic prop names where possible; renaming is a scheduled cleanup — not license to add new Emp*-specific coupling.

---

## 5. Panel Architecture

ModeloBase1 delegates rendering to framework/mak panels:

| Panel | Implementation |
|-------|----------------|
| Form | `MakFormPanel` → `MakFormShell` → `MakCadastroForm` |
| Table | `MakTablePanel` → `MakCadastroTable` (virtualized) |
| Search/Cards | `MakSearchPanel` → module `SearchPanel` component from config |
| Dialogs | `ModeloBase1ExtraDialogs`, filter config dialog |

Re-exports with deprecated Empresas aliases exist for backward compatibility — do not use in new code.

---

## 6. Hooks (ModeloBase1-owned)

| Hook | Purpose |
|------|---------|
| `useModeloBase1InfiniteListData` | Paginated/infinite list |
| `useModeloBase1PreferencesBootstrap` | Module prefs hydration |
| `useModeloBase1ViewModePreference` | Table/cards view mode |
| `useModeloBase1Favorites` | Favorites panel |
| `useModeloBase1CustomFields` | CADCPS integration |
| `useModeloBase1SearchViewHooks` | Search dropdown/cards fields |

Modules **must not** duplicate these hooks.

---

## 7. Domain Extension Points

Modules may customize behavior via metadata hooks (processed by Foundation):

| Hook | Use case |
|------|----------|
| `buildDynamicFields` | Custom field rendering |
| `mapRecordToForm` | Record → form state mapping |
| `prepareSubmitPayload` | Form → API payload |
| `validateFormExtra` | Additional client validation |
| `useFormResourcesHook` | Async resources for form |
| `resolveFieldValue` / `resolveComparableValue` | Display/sort overrides |

**cadcps** is the reference for complex domain runtime while maintaining a thin page.

---

## 8. Events

ModeloBase1 and its children emit/subscribe via module-scoped events:

```javascript
import { dispatchModuleEvent, subscribeModuleEvent } from "@/framework/mak/events/makModuleEvents.js";

dispatchModuleEvent("marcas", "preferences-saved", { ... });
```

Never hardcode `empresas-*` event names in Foundation code.

---

## 9. Disabled Capabilities

**Grouping / pivot** is intentionally disabled in certified ModeloBase1:

```javascript
// createMakGroupingEngine.js
status: "disabled_certified"
```

Do not re-enable without new Capability Pack certification (V21+).

---

## 10. ModeloBase1 Change Process

1. Identify if change is structural (ModeloBase1) or domain (module).
2. Structural changes require gate parity (`gate:modelo-base1`, `gate:paridade-empresas`).
3. Run visual parity gates if UI-affecting (`gate:paridade-visual`).
4. Verify propagation to all 4 certified modules.
5. Update Constitution only if rules change — not for every bugfix.

---

## 11. Anti-Patterns

| Anti-pattern | Correct approach |
|--------------|------------------|
| Copy `ModeloBase1CadastroPage` into module | Use factory overrides |
| Create `TBL*` / `FORM*` components | Use metadata + ModeloBase1 |
| Import ModeloBase1 from modules into Foundation | Bootstrap inversion |
| Hardcode Empresas fields in MakCadastroForm | Use `fieldDefinitions` metadata |
| Skip generator for new module | Always `npm run generate:module` |

---

*Next: [05-CODE-QUALITY-STANDARDS.md](./05-CODE-QUALITY-STANDARDS.md)*
