# 06 — Governance and Gates

**Constitution document:** 06 of 10  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Purpose

Governance transforms architectural rules into **machine-enforced contracts**. Gates are the enforcement arm of this Constitution — they prevent regression without relying on human memory.

Baseline file: `scripts/governance-baseline.json` (v10.1.0)

CI workflow: `.github/workflows/foundation-governance.yml` — runs **G31–G136** (not V13–V20 capability gates; those require manual `verify:*-cert-*` scripts — see TD-013).

---

## 2. Verification Commands

| Command | Scope |
|---------|-------|
| `npm run verify:governance` | build + lint + certification + governance (1 cycle) |
| `npm run verify:governance:cycles` | 5 consecutive full cycles |
| `npm run verify:certification` | build + lint + G31–G108 |
| `npm run gate:governance` | G109–G136 (includes SSOT G127–G136) |
| `npm run gate:ssot` | G127–G136 SSOT propagation |

Individual capability verification:

```bash
npm run verify:validation-cert-v159
npm run verify:formula-cert-v17
npm run verify:event-cert-v18
npm run verify:action-cert-v19
npm run verify:workflow-cert-v20
npm run verify:visual-cert-v152
```

---

## 3. Gate Catalog

### Certification — ModeloBase1 (G31–G45)

**Script:** `scripts/gate-modelo-base1-cert.mjs`  
**Command:** `npm run gate:modelo-base1`

Validates ModeloBase1 exports, MakCadastroTable contract, config factory, hooks, and integration points.

### Paridade Empresas (G58–G72)

**Script:** `scripts/gate-paridade-empresas.mjs`  
**Command:** `npm run gate:paridade-empresas`

Ensures Empresas reference module maintains certified behavior after Foundation changes.

### Promoção de Componentes (G86–G102)

**Script:** `scripts/gate-promocao-componentes.mjs`  
**Command:** `npm run gate:promocao`

Verifies domain modules consume promoted Foundation components — not legacy equivalents.

### Gerador (G103–G108)

**Script:** `scripts/gate-generator-modelobase1.mjs`  
**Command:** `npm run gate:generator`

Enforces:

- Scaffold pages use `ModeloBase1CadastroPage`
- Required template files exist
- Generator updates `cadastro-modules.registry.json`
- No legacy FORM/TBL patterns in templates

### Governança Foundation (G109–G125)

**Script:** `scripts/gate-foundation-governance.mjs`  
**Command:** `npm run gate:governance`

Enforces:

- Certified module file structure
- No forbidden structural patterns in module pages
- No cross-module imports
- No new TODO/FIXME in Foundation
- Thin page LOC limits
- Registry ↔ generatedModules consistency

Includes SSOT propagation subset (G127–G136) when run as part of full governance.

### SSOT Propagation (G127–G136)

**Script:** `scripts/gate-ssot-propagation.mjs`  
**Command:** `npm run gate:ssot`

All certified modules must consume `ModeloBase1CadastroPage` — no structural duplication.

### Layout Config Engine V13 (G156–G165)

**Script:** `scripts/gate-layout-config-engine-v13.mjs`  
**Command:** `npm run gate:layout-config-engine-v13`

### Field Config Engine V14 (G166–G175)

**Script:** `scripts/gate-field-config-engine-v14.mjs`  
**Command:** `npm run gate:field-config-engine-v14`

### Business Boundary V15 (G176–G185)

**Script:** `scripts/gate-business-boundary-v15.mjs`  
**Command:** `npm run gate:business-boundary-v15`

### ModeloBase1 Consolidation V15.1 (G186–G195)

**Script:** `scripts/gate-modelobase1-consolidation-v151.mjs`

### Visual Certification V15.2 (G196–G206)

**Script:** `scripts/gate-modelobase1-visual-cert-v152.mjs`  
**Command:** `npm run gate:modelobase1-visual-cert-v152`

### Validation Config Engine V16 (G207–G217)

**Script:** `scripts/gate-validation-config-engine-v16.mjs`

### Formula Config Engine V17 (G218–G228)

**Script:** `scripts/gate-formula-config-engine-v17.mjs`

### Events Config Engine V18 (G229–G239)

**Script:** `scripts/gate-event-config-engine-v18.mjs`

### Actions Config Engine V19 (G240–G250)

**Script:** `scripts/gate-action-config-engine-v19.mjs`

### Workflow Config Engine V20 (G251–G261)

**Script:** `scripts/gate-workflow-config-engine-v20.mjs`

### Visual Parity Promotion

**Script:** `scripts/gate-paridade-visual-promocao.mjs`  
**Command:** `npm run gate:paridade-visual`

### Functional / Foundation Completion

**Scripts:** `gate-functional-completion.mjs`, `gate-foundation-completion.mjs`

---

## 4. Baseline Exceptions (Frozen Allowlists)

From `governance-baseline.json`:

```json
{
  "legacyModuleExceptions": ["template", "fieldcert", "validationcert", "formulacert", "eventscert", "actionscert", "workflowcert"],
  "infrastructureModuleExceptions": ["makBootstrap"],
  "legacyComponentAllowlist": [
    "src/modules/template/components/FORMTemplate.jsx",
    "src/modules/template/components/TBLTemplate.jsx"
  ],
  "legacyHookAllowlist": [
    "src/modules/empresas/hooks/useEmpresasInfiniteData.js"
  ]
}
```

**Widening allowlists is a governance failure** unless accompanied by Constitution amendment and explicit sunset plan.

---

## 5. Forbidden Structural Patterns

Gates scan module pages for forbidden imports/patterns:

| Area | Forbidden examples |
|------|-------------------|
| Toolbar | `Toolbar.jsx`, `ActionBar.jsx`, `ListToolbar`, `SankhyaListToolbar` |
| Search | `SearchPanel.jsx`, `SearchView.jsx`, `SRCHEMP.jsx` |
| Table | `TablePanel.jsx`, `TBL*` |
| Form | `FormPanel.jsx`, `FORM*` |
| Dock | `Dock.jsx`, `ContextPanel.jsx` |
| Dialog | `ConfigDialog.jsx`, `ExportDialog.jsx` (structural — domain export config OK) |

---

## 6. When to Run Which Gates

| Change touches | Minimum verification |
|----------------|---------------------|
| ModeloBase1 | `gate:modelo-base1` + `gate:paridade-empresas` |
| framework/mak | `verify:certification` |
| Module page/config | `gate:governance` + `gate:ssot` |
| Generator templates | `gate:generator` + dry-run generate |
| Config engine | Relevant V13–V20 gate + build |
| Visual/CSS tokens | `gate:modelobase1-visual-cert-v152` |
| Any release candidate | `verify:governance:cycles` |

---

## 7. Gate Failure Protocol

1. **Do not disable gates** to merge — fix code or request formal exception.
2. If gate is wrong (false positive), fix the gate in a dedicated PR with evidence.
3. If exception is legitimate, update baseline + Constitution + gate comment.
4. Document incident in future Journal mission.

---

## 8. Relationship to Constitution

| Constitution rule | Enforcing gate |
|-------------------|----------------|
| Thin pages | G109–G125 |
| No structural duplication | G127–G136 |
| Generator-only modules | G103–G108 |
| Foundation TODO-free | G109 (baseline check) |
| Config engine integration | G156–G261 |
| Business boundary | G176–G185 |

Gates are authoritative for **detectable** violations. Undetectable violations (e.g. wrong business rule) require code review and domain tests.

---

## 9. Adding New Gates (V21+)

New capability packs require:

1. New gate script `scripts/gate-{name}-v{version}.mjs`
2. npm script in `package.json`
3. Certification module (`*cert`) if metadata-only proof needed
4. Catalog doc in `/docs/`
5. Constitution update in this document
6. Bootstrap registration in `makBootstrap`

---

*Next: [07-PRINCIPLES-OF-PROMOTION.md](./07-PRINCIPLES-OF-PROMOTION.md)*
