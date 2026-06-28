# 05 — Code Quality Standards

**Constitution document:** 05 of 11  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Quality Bar

MAK Gestão targets **enterprise-grade** maintainability:

- Zero ESLint errors on `src/` (required for merge)
- Production build must succeed (`npm run build`)
- Governance gates must pass for Foundation-touching changes
- Domain modules stay thin; complexity lives in config/metadata or backend

TypeScript typecheck (`npm run typecheck`) has **known noise** in `src/shared/ui/*` (shadcn JSX without full prop types). This is documented debt — not license to add new untyped structural code.

---

## 2. Language and Module System

| Area | Standard |
|------|----------|
| Frontend | JavaScript (ES modules) + JSX — `type: "module"` |
| Backend | JavaScript (ES modules) |
| Validation | Zod schemas (frontend + backend) |
| Styling | Tailwind CSS + CSS modules/files for cadastro scopes |
| Path aliases | `@/` → `src/` (Vite + jsconfig) |

No TypeScript migration of Foundation without formal mission. New domain files follow existing module conventions (`.js` / `.jsx`).

---

## 3. Naming Conventions

### Module identifiers

| Item | Pattern | Example |
|------|---------|---------|
| `moduleId` | lowercase, kebab-case | `centros-custo` |
| `keyPrefix` | 3 letters | `ccu` |
| `pageCode` | `PAG` + prefix upper | `PAGCCU` |
| `entityName` | PascalCase + `Cadastro` | `CentroCustoCadastro` |
| Constants prefix | `{PREFIX}_` | `CCU_COLUNAS_BASE` |
| Registry codigo | UPPER_SNAKE | `CENTROS_CUSTO` |

### Files

| Type | Pattern |
|------|---------|
| Page | `pages/PAG{CODE}.jsx` |
| ModeloBase1 config | `config/{moduleId}ModeloBase1Config.js` |
| Mak module | `config/{moduleId}MakModule.js` |
| Metadata | `config/{moduleId}ModuleMetadata.js` |
| Cadastro config | `config/{moduleId}CadastroConfig.js` |
| Preferences | `config/{moduleId}PreferencesAdapter.js` |
| List cache | `data/{moduleId}ListCache.js` |
| Repository | `repositories/{name}Repository.js` |
| API client | `src/apis/{moduleId}/{Name}Api.js` |

### Backend

```
backend/src/modules/{moduleId}/
  routes.js
  validators.js
  services/{name}Service.js
  repositories/{name}Repository.js   # preferred; CADCPS exception: repCps.js
```

---

## 4. File Size and Complexity

| Area | Guideline |
|------|-----------|
| Module page | ≤ 25 LOC |
| Module config file | Prefer declarative; split constants if > 400 LOC |
| Foundation monoliths | `MakCadastroTable.jsx`, `ModeloBase1CadastroPage.jsx` — modify only with gate parity; decompose via mission |
| New functions | Single responsibility; match surrounding file style |

Avoid drive-by refactors in large Foundation files. If touching them, run full certification suite.

---

## 5. Comments and Markers

### Foundation (`ModeloBase1`, `framework/mak`)

- **Zero new `TODO` / `FIXME` / `HACK`** — enforced by `governance-baseline.json`
- Comments explain **non-obvious business or architectural** decisions only
- Self-explanatory code preferred over narrative comments

### Domain modules

- `TODO` allowed sparingly — must reference issue/mission ID
- `@deprecated` exports require removal timeline or link to promotion mission

---

## 6. Imports

### Order (convention)

1. React / external libraries
2. `@/framework/*`, `@/ModeloBase1/*`
3. `@/shared/*`
4. `@/modules/{currentModule}/*` (relative preferred within module)
5. Styles

### Prohibited

- Cross-import between cadastro domain modules (gate enforced)
- Domain module importing another module's internal config
- Foundation importing `modules/*` (except bootstrap pattern)

---

## 7. Error Handling

| Layer | Standard |
|-------|----------|
| API client | Throw or return structured errors; `apiClient` handles auth headers |
| React UI | `MakErrorState`, toast via ErpToaster |
| Backend routes | Global error handler; DB errors → 503; validation → 400 |
| Form validation | Zod + Validation Config Engine |

Do not swallow errors silently in Foundation preference sync — surface `syncStatus` states.

---

## 8. Testing Expectations

| Type | Command | When required |
|------|---------|---------------|
| Lint | `npm run lint` | Every PR |
| Build | `npm run build` | Every PR |
| Governance | `npm run verify:governance` | Foundation/module/generator changes |
| E2E | `npm run test:e2e` | Preference/architecture changes (needs backend `.env`) |
| Mock E2E | `npm run test:e2e:empresas-novo` | Frontend-only cadastro flows |
| Backend probes | `backend/scripts/securityMultiempresaProbe.js` | Auth/scope changes |

New domain modules: at minimum smoke script from generator scaffold backend.

---

## 9. Security Standards

- Never commit secrets — use `.env.local`, `backend/.env`
- Frontend sends `Authorization: Bearer` + `X-Empresa-Id` via `apiClient`
- Backend re-validates user from DB on each request (`loadAccessScope`)
- Reject client-controlled identity fields (`cliente_id`, `usuario_id`, etc.)
- RBAC: CONSULTA < OPERADOR < ADMIN (`cadastroRbac.js`)

---

## 10. Dependency Management

- Pin major dependencies; run `npm audit` on frontend changes
- Backend dependencies independently audited (`backend/package.json`)
- Do not add UI libraries that duplicate shadcn/Radix without Architecture review

Current known frontend audit debt: vulnerabilities in dev/transitive packages — address via dedicated mission, not drive-by major upgrades during feature work.

---

## 11. Formatting

- ESLint 9 flat config (`eslint.config.js`)
- 2-space indent (project convention)
- Prettier not mandated globally — match existing file formatting

---

## 12. Pull Request Checklist

Before requesting review:

- [ ] Scope limited to stated mission
- [ ] No Foundation violation (or formal exception documented)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Relevant gates pass
- [ ] No new Emp*-structural duplication in domain modules
- [ ] Constitution/docs updated if rules changed

---

*Next: [06-GOVERNANCE-AND-GATES.md](./06-GOVERNANCE-AND-GATES.md)*
