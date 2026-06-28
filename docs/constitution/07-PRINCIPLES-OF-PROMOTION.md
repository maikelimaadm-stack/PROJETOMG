# 07 — Principles of Promotion

**Constitution document:** 07 of 10  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Definition

**Promotion** is the process of moving reusable infrastructure from a domain module (typically Empresas, historically the reference implementation) into the Foundation — ModeloBase1, framework/mak, or cadastro-engine.

Promotion prevents duplication and ensures improvements propagate to all modules via SSOT.

**Copy-paste from Empresas into another module is prohibited.** Promote to Foundation, then consume via metadata/config.

---

## 2. When to Promote

Promote code when it is:

| Criterion | Question |
|-----------|----------|
| **Reusable** | Would at least 2 modules need this behavior? |
| **Domain-agnostic** | Does it avoid Empresa-specific field names/rules? |
| **Structural or infra** | Is it UI structure, validation infra, masks, filters, prefs — not business rule? |
| **Stable** | Has it been proven in production/reference module? |

Do **not** promote:

- Entity-specific validation (CNPJ rules for Empresa)
- Column labels tied to one entity's semantics
- Export PDF templates for one module
- Backend persistence logic

---

## 3. Promotion Targets

| Code type | Target layer |
|-----------|--------------|
| Layout configurator UI | cadastro-engine/design-system → framework/mak/layoutConfig |
| Field rendering/masks | cadastro-engine/field |
| Filter helpers | shared/filters → framework/mak/listing |
| Dynamic field builders | framework/mak/metadata |
| Preference storage factories | framework/mak/preferences |
| Table virtualization | shared/hooks → ModeloBase1 |
| Validation rules (generic) | framework/mak/validation |
| UX states | framework/mak/ux |

Legacy source during transition: `framework/cadastro/` (Emp* components) — promotion destination is **never** another Emp* copy.

---

## 4. Promotion Process

### Step 1 — Classify

Use Business Boundary matrix (see `docs/ENTERPRISE_V15_BUSINESS_BOUNDARY_REPORT.md`):

| Classification | Action |
|----------------|--------|
| REGRA DE NEGÓCIO | Keep in domain module |
| INFRAESTRUTURA | Promote to Foundation |
| MISTO | Extract infra; leave domain wrapper |

### Step 2 — Implement in Foundation

- Add to appropriate layer with **generic naming** (no `emp`, `Empresas` in public API)
- Provide metadata/config hook for domain customization
- Register in bootstrap if engine-related

### Step 3 — Replace domain usage

- Domain module becomes thin wrapper or re-export
- Deprecate old export with `@deprecated` comment and timeline

### Step 4 — Verify gates

```bash
npm run gate:promocao
npm run gate:business-boundary-v15
npm run verify:governance
```

### Step 5 — Document

- Update relevant catalog/inventory doc
- If promotion changes rules, update Constitution

---

## 5. Historical Promotion Examples (Evidence)

| Item | From | To |
|------|------|-----|
| Form field runtime | `empresasFormRuntime.jsx` (290 LOC) | `buildMakDynamicFieldsWithCustomFields` |
| Custom field append | empresas runtime | `appendMakCustomDynamicFields.js` |
| Masks | `formEmp.constants.js` | `cadastro-engine/field/maskUtils.js` |
| Column range filters | `tblEmp.filters.js` | `shared/filters/columnRangeFilters.js` |
| Filter layout storage | `empFilterFieldsLayout.js` | `createMakFilterFieldsLayoutStorage.js` |
| Search panel | Empresas components | `ModeloBase1/search/MakCadastroSearchPanel.jsx` |
| Infinite list hook | Empresas | `useModeloBase1InfiniteListData` |

---

## 6. Shim and Alias Policy

During promotion, temporary shims are allowed:

```javascript
/** @deprecated Import from `@/framework/cadastro-engine/field/maskUtils` */
export { formatCnpj } from "@/framework/cadastro-engine/field/maskUtils.js";
```

Shims must be:

1. Listed in gate allowlists if structural, OR
2. Removed within a defined mission
3. Not duplicated across modules

---

## 7. framework/cadastro Legacy Layer

`src/framework/cadastro/` (~11K LOC) contains pre-promotion Emp* configurators still used by:

- Layout/field configurators (`EmpLayoutConfiguratorDialog`, etc.)
- CADCPS form runtime (partial imports)
- Template demo module

**Direction:** Continue promotion into cadastro-engine + framework/mak. Do not add new files to `framework/cadastro/`. New configurators go to Foundation design-system paths.

---

## 8. Promotion vs. Override

| Mechanism | When |
|-----------|------|
| **Promotion** | Behavior reusable across modules |
| **Factory override** | Module-specific config of Foundation behavior |
| **Metadata hook** | Domain-specific field/form logic |
| **Domain runtime file** | Complex module exception (cadcps model) — requires formal certification |

---

## 9. Review Checklist

Before merging a promotion PR:

- [ ] Zero Emp*-specific names in new Foundation public API
- [ ] Domain module reduced or shimmed — not duplicated
- [ ] All certified modules still pass SSOT gates
- [ ] Paridade Empresas gate passes
- [ ] Catalog/inventory updated

---

*Next: [08-DO-NOT-DO-LIST.md](./08-DO-NOT-DO-LIST.md)*
