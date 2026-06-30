# User Journey Deep Audit

**Mission:** Program 3.8.6 — Audits 3 & 4  
**Method:** Trace actual code paths with file evidence

---

## Scenario A — Company created from zero

| Step | What happens | Path evidence |
|------|--------------|---------------|
| 1 | User opens app | `App.jsx` → `/CadastroEmpresas` |
| 2 | List view | `PAGEMP.jsx` → `ModeloBase1CadastroPage` |
| 3 | Click "Nova Empresa" | `handleNew()` — `ModeloBase1CadastroPage.jsx` |
| 4 | Form renders | `MakCadastroForm` + `empresasCadastroConfig` |
| 5 | Custom fields load | `GET /api/cadastro/EmpresaCadastro/campos` |
| 6 | User fills `razao_social` (required) | `empresasSchema` + backend `empresaCreateSchema` |
| 7 | Save | `POST /api/empresas` → Prisma `empresa.create` |
| 8 | Audit / counters | `auditService`, `getContadores` |

**Business Assets created:** **None**  
**Business Intent created:** **None**  
**Studios involved:** **None**  
**Engines:** cadastro-engine, campoEngine (display), validation, optional formulas  
**Runtime projection:** CRB-hydrated engines if empresas cache valid  
**Metadata:** MDP fields via CADCPS read path · not Intent metadata

---

## Scenario B — New field (custom)

| Step | Path |
|------|------|
| Admin opens CADCPS or Field Studio | `/studio/empresas/field` or `PAGCPS.jsx` |
| Creates field definition | Field Studio → MDP field via `mdpFieldClient` |
| Persists | `mdpField` table via backend |
| Runtime | `listCampos` on form load |

**Business Asset:** **No** — MDP field definition, not Business Computed Field  
**Intent Resolver:** **Not invoked**

---

## Scenario C — New calculated field (today vs vision)

### Today (production)

| Step | Component |
|------|-----------|
| User opens Formula Builder | `/studio/empresas/formula` |
| Edits `expressionSource` text | `FormulaEditor.jsx` |
| Preview | Computation Engine G302 pipeline |
| Save | Formula document in Studio project |
| Runtime (empresas form) | **campoEngine.calcularFormula** OR **runMakFormulaEvaluation** — **not G306 path** |

### Vision (architecture)

| Step | Component |
|------|-----------|
| User describes business rule | Business Language UI (not shipped) |
| Intent created | `mak-business-intent-document-v1` |
| Resolver | G305 → G306 |
| Business Computed Field | `src/studio/business/` |
| Formula projection | `derivedFromBusinessComputedField: true` |
| Runtime projection | `derived_projection_only` |

**Misalignment ID:** EPDA-P0-01, EPDA-P0-02

---

## Scenarios D–T (not available in product today)

| User wants | Today | Vision path | Status |
|------------|-------|-------------|--------|
| Workflow | ❌ | Intent → Workflow Asset → projection | Program 3.9 planned |
| Automation | ❌ | Intent → Automation Asset | Extension point |
| Dashboard | ❌ | Intent → Dashboard Asset | Extension point |
| Indicator | ❌ | Intent → Indicator Asset | Extension point |
| Report | ❌ | Intent → Report Asset | Extension point |
| Integration | ❌ | Intent → Integration Asset | Extension point |
| IA | ❌ | Intent → IA config Asset | Extension point |
| Document | ❌ | Intent → Document Asset | Extension point |
| Process | ❌ | Intent → Process Asset | Extension point |
| Capability (new) | ❌ | Capability catalog admin | Arch only |
| Business Object (new type) | ⚠️ | BOM universal model | MDP entity today |
| Template | ❌ | Intent template library | D-059 arch |
| Marketplace Package | ❌ | `.makpkg` manifest | Vision only |
| Organization | ❌ | D-066 org graph | Docs only |
| New module | ⚠️ | `npm run generate:module` | Generator ✅ |
| New Runtime | ⚠️ | CRB publish pipeline | empresas pilot |
| Digital Twin | ❌ | Twin simulation layer | Vision D-057 |

---

## AUDIT 4 — Technology exposure

| Technology | User sees? | Where (if YES) | Severity | Vision behavior |
|------------|------------|----------------|----------|-----------------|
| Code | NO* | *unless custom extensions | — | OK |
| JSON | **YES** | Layout/field documents internal; export paths | P2 | Hidden by Progressive Disclosure |
| AST | NO direct | — | — | OK |
| SQL | NO | — | — | OK |
| Runtime | NO | — | — | OK |
| Engines | NO labels | — | — | OK |
| Resolver | NO | — | — | OK |
| Formula Builder | **YES** | `/studio/empresas/formula` | **P0** | Expert shell only; business terms |
| Computation | NO name | Preview shows value | — | OK |
| Dependency | NO | — | — | OK |
| Evaluation | NO | — | — | OK |
| Type System | NO | — | — | OK |
| **expressionSource** | **YES** | FormulaEditor | **P0** | Business Language only |

---

## Persona journeys

### Beginner

- Uses: Empresas list/form, basic navigation
- Cannot: create calculation without Studio training
- **Gap:** EPDA-P0-04

### Intermediate

- Uses: Field Studio, Formula Builder, CADCPS
- Sees: expressions, field types, layout concepts
- **Gap:** EPDA-P0-01

### Expert / Admin

- Uses: Studio full stack, MDP APIs, RBAC (OPERADOR+ mutation)
- Sees: all intermediate + export, module guards
- **Gap:** no Business Asset catalog; no org graph UI (D-066)

### Enterprise (1000+ users)

- **ERI 3.8/10** (PMI) — event bus not started (TD-010)
- Multi-tenant: `cliente_id` scope on empresa — evidence `empresaRepository`
- **Gap:** scalability programs not started; intelligence absent

---

*Cross-ref: [USER-EXPERIENCE-JOURNEY-AUDIT.md](./USER-EXPERIENCE-JOURNEY-AUDIT.md) (3.8.5 strategic)*
