# 03 — Foundation Rules

**Constitution document:** 03 of 10  
**Status:** Official  
**Version:** 1.0.0  
**Foundation version:** Enterprise V10.1.0 (frozen 2026-06-27)

---

## 1. Definition

The **Foundation** is the certified, frozen structural layer of MAK Gestão that enables cadastro modules without per-module UI development.

### Foundation components

| Component | Location | Status |
|-----------|----------|--------|
| ModeloBase1 | `src/ModeloBase1/` | Frozen — cadastro UI motor |
| framework/mak | `src/framework/mak/` | Frozen — runtime, engines, preferences |
| cadastro-engine | `src/framework/cadastro-engine/` | Frozen — layout/field/validation/render primitives |
| Official generator | `scripts/generate-cadastro-module.mjs` | Frozen contract — templates enforced by gates |
| Module registry | `config/cadastro-modules.registry.json` | SSOT for certified modules |
| Governance baseline | `scripts/governance-baseline.json` | Machine-readable frozen rules |
| makBootstrap | `src/modules/makBootstrap/` | Infrastructure — engine registration |

### Not Foundation (transitional / domain)

| Component | Location | Status |
|-----------|----------|--------|
| framework/cadastro | `src/framework/cadastro/` | Legacy Emp* — promotion in progress |
| Domain modules | `src/modules/{moduleId}/` | Domain only |
| Certification modules | `fieldcert`, `validationcert`, etc. | Metadata-only — not runtime |
| template module | `src/modules/template/` | Scaffold/demo — not production runtime |

---

## 2. Frozen Status

**Frozen** means:

1. No breaking changes to public contracts consumed by certified modules.
2. No new structural patterns outside ModeloBase1 / framework/mak.
3. Evolution only via **backward-compatible** additions.
4. Zero new `TODO` / `FIXME` in `src/ModeloBase1` and `src/framework/mak` (enforced by baseline).
5. CI gates must continue passing without widening forbidden-pattern exceptions.

Breaking changes require the **Amendment Process** in [00-MAK-CONSTITUTION.md](./00-MAK-CONSTITUTION.md).

---

## 3. What Foundation Owns

- Cadastro page shell and orchestration
- Toolbar, table, form, search, cards, dock, dialogs
- Loading, empty, and error UX states
- Table/card virtualization infrastructure
- Preference read/write/sync motor
- Config engines V13–V20 (metadata + registries + bootstrap)
- Metadata builders (`buildMakFormMetadata`, `buildMakTableMetadata`, etc.)
- Visual tokens and scope CSS for cadastro
- Module-scoped event naming and dispatch
- Standard dynamic field rendering pipeline
- Import and History engine registries

---

## 4. What Foundation Must NOT Own

- Entity-specific field lists (e.g. CNPJ rules for Empresa)
- Domain export formats (PDF layout for Empresas)
- Backend business rules and persistence
- Tenant-specific module licensing logic (backend `ClienteModulo`)
- CADCPS field definitions (domain module + backend)

---

## 5. Import Boundaries

### Forbidden

```javascript
// Inside src/ModeloBase1/** or src/framework/mak/**
import something from "@/modules/empresas/...";  // ❌
import something from "@/modules/produtos/...";   // ❌
```

Foundation **must not** depend on domain modules.

### Allowed pattern — bootstrap inversion

```javascript
// src/modules/makBootstrap/registerMakLayoutConfigEngine.js
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";
registerMakLayoutConfigEngine("empresas", createMakLayoutConfigEngine(empresasCadastroConfig));
```

Domain configs are pulled **into** bootstrap at app start — never pushed from Foundation outward.

---

## 6. Certified Module Contract

Every runtime module in `cadastro-modules.registry.json` must contain:

```
config/{moduleId}ModeloBase1Config.js
config/{moduleId}MakModule.js
config/{moduleId}ModuleMetadata.js
config/{moduleId}CadastroConfig.js
config/{moduleId}PreferencesAdapter.js
data/{moduleId}ListCache.js
pages/PAG*.jsx
```

Empresas exception: config may live at `config/modeloBase1/empresasModeloBase1Config.js` (gate-approved).

---

## 7. Formal Exceptions

Documented in `docs/MODELOBASE1_CERTIFICATION_EXCEPTIONS.md` and `governance-baseline.json`:

| Exception | Type | Rule |
|-----------|------|------|
| `template` | Legacy module | Scaffold/demo only — not in production registry |
| `fieldcert` … `workflowcert` | Certification | Metadata-only — no pages, no menu |
| `makBootstrap` | Infrastructure | Side-effect registration |
| `cadcps` | Domain runtime | Thin page; custom form/table runtime hooks allowed |
| `empresas` | Reference module | Extended overrides via factory; richest metadata |
| Legacy hook allowlist | `useEmpresasInfiniteData.js` | Shim until removed |
| Legacy component allowlist | FORMTemplate, TBLTemplate | Template demo only |

**New exceptions require baseline update + Constitution amendment.**

---

## 8. Evolution Rules

| Change type | Allowed? | Process |
|-------------|----------|---------|
| Bug fix (backward-compatible) | ✅ | PR + gates |
| New metadata field on builders | ✅ | PR + gates + catalog update |
| New config engine capability | ✅ | New gate suite (V21+) + cert module |
| Rename public export used by modules | ❌ | Amendment + migration |
| Split ModeloBase1CadastroPage | ⚠️ | Formal mission — maintain gate parity |
| New imperative cadastro page | ❌ | Constitutional violation |
| Duplicate toolbar/table in module | ❌ | Blocked by G109–G125 |

---

## 9. Generator as Foundation Extension Point

The **only approved way** to create new cadastro modules:

```bash
npm run generate:module -- \
  --moduleId {id} \
  --entityName {Entity}Cadastro \
  --singularLabel {Singular} \
  --pluralLabel {Plural} \
  --repository {repo} \
  --api {Api} \
  --schema {schema}
```

Generator updates:

- `src/modules/{moduleId}/` from `template/scaffold/`
- `backend/src/modules/{moduleId}/` from `template/scaffold-backend/`
- `src/modules/generatedModules.json`
- `config/cadastro-modules.registry.json`

Templates must produce `ModeloBase1CadastroPage` thin pages (G103–G108).

---

## 10. Foundation Verification

```bash
npm run gate:modelo-base1      # G31–G45
npm run gate:certification     # G31–G108
npm run gate:governance        # G109–G125
npm run verify:governance      # Full suite
```

Capability engine gates: see [06-GOVERNANCE-AND-GATES.md](./06-GOVERNANCE-AND-GATES.md).

---

*Next: [04-MODELOBASE1-RULES.md](./04-MODELOBASE1-RULES.md)*
