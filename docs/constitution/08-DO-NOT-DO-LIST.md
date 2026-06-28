# 08 — Do Not Do List

**Constitution document:** 08 of 10  
**Status:** Official  
**Version:** 1.0.0

---

This list is **explicit and binding**. Violations require rollback — not baseline widening.

---

## 1. Architecture

| # | Do NOT | Do instead |
|---|--------|------------|
| D1 | Create imperative cadastro pages (FORM/TBL/SRCHEMP patterns) | Thin `ModeloBase1CadastroPage` + config |
| D2 | Implement custom toolbar, table, form, search, or dock in domain modules | Declare metadata; use ModeloBase1 |
| D3 | Copy structural code from Empresas into new modules | Use generator + factory; promote if reusable |
| D4 | Import `modules/*` from ModeloBase1 or framework/mak | Bootstrap inversion via makBootstrap |
| D5 | Import one cadastro module from another | Shared code → Foundation or shared/ |
| D6 | Create parallel Layout/Field/Validation engines | Extend V13–V20 config engines |
| D7 | Re-enable column grouping/pivot without new Capability Pack | Accept `disabled_certified` status |
| D8 | Build MAK Studio as separate UI framework | Future Studio consumes existing metadata APIs |
| D9 | Add third design system for cadastro | Use ModeloBase1 tokens + shadcn shell |
| D10 | Manually scaffold certified modules (skip generator) | `npm run generate:module` |

---

## 2. Foundation

| # | Do NOT | Do instead |
|---|--------|------------|
| D11 | Make breaking changes to `buildModeloBase1ConfigFromMakModule` contract | Backward-compatible additions |
| D12 | Add TODO/FIXME/HACK to ModeloBase1 or framework/mak | Fix or create mission |
| D13 | Hardcode Empresas field names in Foundation components | Use metadata `fieldDefinitions` |
| D14 | Hardcode `empresas-*` event names in Foundation | `getModuleEventName(moduleId, suffix)` |
| D15 | Unfreeze Foundation without Amendment Process | See 00-MAK-CONSTITUTION.md |
| D16 | Create structural components in `framework/cadastro/` | Promote to cadastro-engine/mak |
| D17 | Duplicate MakCadastroTable or ModeloBase1CadastroPage | Extend via config/hooks |

---

## 3. Modules and Domain

| # | Do NOT | Do instead |
|---|--------|------------|
| D18 | Add module to registry without generator artifacts | Full scaffold + gate verification |
| D19 | Put structural hooks in domain modules | ModeloBase1 hooks |
| D20 | Embed UI layout logic in repository files | Repository = API adapter only |
| D21 | Bypass RBAC in backend routes | `loadAccessScope` + `cadastroRbac` |
| D22 | Accept client-supplied `cliente_id` / `usuario_id` | Server-side scope from JWT |
| D23 | Create cadcps-style heavy runtime without formal exception | Certify exception first |

---

## 4. Backend and Data

| # | Do NOT | Do instead |
|---|--------|------------|
| D24 | Add Prisma models without migration | `prisma migrate dev` + deploy path |
| D25 | Rely only on `ensureSchema.js` for new tables | Prisma migration as primary |
| D26 | Let frontend registries diverge from backend | Keep registries synchronized |
| D27 | Store secrets in source code | Environment variables |
| D28 | Skip module guard on licensed features | `ensureModuloAtivo` |

---

## 5. Governance and Process

| # | Do NOT | Do instead |
|---|--------|------------|
| D29 | Disable or skip gates to merge | Fix code or formal exception |
| D30 | Widen legacy allowlists without Amendment | Document + sunset plan |
| D31 | Treat chat history as authoritative | Read Constitution + verify code |
| D32 | Merge Foundation changes without `verify:governance` | Run full or scoped gates |
| D33 | Use old audit reports as sole evidence | Verify against current code |
| D34 | Refactor unrelated code in feature PRs | Minimal focused diff |

---

## 6. AI and Automation

| # | Do NOT | Do instead |
|---|--------|------------|
| D35 | Let AI rewrite Foundation without gate verification | Scoped changes + full gates |
| D36 | Accept AI claims about architecture without code citation | Read files; run gates |
| D37 | Generate modules by copying files | Use official generator |
| D38 | Auto-commit Constitution changes without human review | PR with explicit summary |

See [09-AI-RULES.md](./09-AI-RULES.md) for full AI policy.

---

## 7. Future Platforms (Not Yet Implemented)

| # | Do NOT | Do instead |
|---|--------|------------|
| D39 | Implement Marketplace plugin runtime ad-hoc | Wait for platform mission + schema |
| D40 | Add OpenAI/LLM calls without AI Platform mission | No shadow AI integrations |
| D41 | Build offline sync without architecture spec | Preferences cache is not offline ERP |
| D42 | Create parallel data dictionary schema | Extend CADCPS / entity catalog mission |

---

## 8. Escalation

If a mission **appears to require** a Do-Not-Do action:

1. Stop implementation.
2. Document why in PR description.
3. Propose Constitution amendment or formal exception.
4. Get explicit approval before proceeding.

---

*Next: [09-AI-RULES.md](./09-AI-RULES.md)*
