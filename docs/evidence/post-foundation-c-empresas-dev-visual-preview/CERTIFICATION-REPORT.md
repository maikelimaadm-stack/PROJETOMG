# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Empresas Dev-Only Visual Preview
**Branch:** `claude/post-foundation-c-empresas-dev-visual-preview`
**Base:** `main` @ `307604cc` (post Empresas Controlled Preview Sandbox merge)
**Gates:** G423-PREVIEW-EMPRESAS-DEV (PASS 20/20) · G423-PREVIEW-EMPRESAS (PASS 15/15) · G423-SHADOW-EMPRESAS-TABLE-FORM (PASS 13/13) · G423-SHADOW-EMPRESAS (PASS 13/13) · G423-SHADOW (PASS 13/13) · G423 master (PASS 7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/preview/dev/devPreviewConfig.js` | Testable core — `isEmpresasDevPreviewEnabled()`, `createEmpresasDevPreviewModel()`, flag constants. Pure, framework-free. |
| `src/runtime/preview/dev/EmpresasDevPreview.jsx` | Dev-only React component — opt-in, fails closed when the flag is off; renders the isolated preview. |
| `src/runtime/preview/dev/PreviewTable.jsx` | Presentational — renders the table structure (columns/labels/sortable/filterable metadata). |
| `src/runtime/preview/dev/PreviewForm.jsx` | Presentational — renders the form structure (fields/labels/required/permission/validation metadata). |
| `src/runtime/preview/dev/PreviewDiagnostics.jsx` | Presentational — renders diagnostics, differences, actions/workflows as text metadata, and masked metadata. |
| `src/runtime/preview/dev/errors.js` | `EmpresasDevPreviewError` (`MAK-L3-DEV-PREVIEW-001`..`002`) |
| `src/runtime/types/dev-preview.js` | JSDoc types (`EmpresasDevViewModel`, `DevPreviewTable`, `DevPreviewForm`, `DevPreviewDiagnostics`, `DevPreviewStatus`) |
| `src/runtime/__tests__/preview/empresas-dev-visual-preview.test.js` | 24 tests — flag off-by-default, prod-fails-closed, view model table/form/diagnostics, actions/workflows metadata-only, no-side-effect/no-backend/no-Prisma, no-menu/no-route, masking, prototype-pollution guard, invalid-model fallback, determinism, barrel-has-no-React |
| `scripts/gates/g423-empresas-dev-visual-preview.mjs` | Gate G423-PREVIEW-EMPRESAS-DEV |
| `docs/evidence/post-foundation-c-empresas-dev-visual-preview/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-empresas-dev-visual-preview/MODULE-DIAGRAMS.md` | Mermaid — dev preview position and flow |
| `docs/evidence/post-foundation-c-empresas-dev-visual-preview/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports ONLY the pure helpers `createEmpresasDevPreviewModel`, `isEmpresasDevPreviewEnabled` — the React `.jsx` components are intentionally NOT exported from the framework-free runtime barrel. |
| `package.json` | Added `test:runtime:preview:empresas-dev`, `gate:g423-preview-empresas-dev`; appended the dev-preview test to the aggregated `test:runtime`. No dependency added. |

**Nenhum arquivo de UI de produção** (`src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`), **nenhum item de menu/navegação**, **nenhuma rota**, **nenhum arquivo SSOT**, e **o runtime legado** foram tocados — confirmado por `git diff` e pelo gate.

**Arquitetura de testabilidade (React sob `node --test`):** o `node --test` não interpreta JSX. Por isso toda a lógica testável vive em `devPreviewConfig.js` (`.js` puro), e os `.jsx` são wrappers presentacionais finos que consomem o view model puro. Os testes importam apenas o `.js` e inspecionam os `.jsx` como texto (regex de source-scan); os `.jsx` são compilados pelo Vite no `npm run build` e lintados pelo `eslint src`. Nenhum componente React entra no barrel `src/runtime/index.js`, evitando puxar React para o core framework-free do runtime.

**src/App.jsx alterado:** **Não.** O preview dev-only é isolado; não é montado automaticamente, não aparece em menu, não cria rota.

---

## O que foi implementado

`EmpresasDevPreview` é uma prévia visual **dev-only**, **opt-in** e isolada do preview model runtime v2 de Empresas — para desenvolvimento, validação e inspeção interna apenas. Não controla a tela real de Empresas, não é montada na navegação, não é rota pública. Renderiza apenas dados estruturais (tabela, formulário, diagnostics, differences, actions/workflows como texto) e nunca executa action/workflow/connector, salva dados, ou chama backend.

- **`isEmpresasDevPreviewEnabled(env)`** — off por padrão; requer a flag `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW === 'true'` **e** ambiente não-produção; em produção **falha fechado** salvo o override explícito e documentado `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_ALLOW_PROD === 'true'`. Resolve env de `import.meta.env` (Vite) com fallback para `process.env` (node --test), aceitando env explícito para testes.
- **`createEmpresasDevPreviewModel(previewModel, options)`** — transforma o preview model num view model determinístico e plano; mascara chaves sensíveis; bloqueia poluição de protótipo (lança); um preview model inválido degrada para um **fallback seguro** (`valid: false`, nunca lança).
- **`EmpresasDevPreview.jsx`** — quando a flag está off, renderiza `null` (fail closed); quando on em dev, renderiza as seções (Header/Status/Table/Form/Diagnostics/Differences/Metadata) via os componentes presentacionais.

**Preview visual — seções:** Header ("Empresas — Runtime v2 Preview"), Status (enabled/skipped/dev-only/valid|fallback), Table Preview, Form Preview, Diagnostics, Differences, Metadata.

**Modelo de falha de duas camadas:** poluição de protótipo/opção inválida **lançam** `EmpresasDevPreviewError`; preview model inválido/malformado → **fallback seguro** (nunca lança), garantindo que uma prévia inválida jamais quebre o harness/app.

## Integração

- **ControlledPreview / PreviewModel:** o dev preview consome o preview model produzido pelo slice anterior (`createPreviewModel`), transformando-o num view model render-ready.
- **Sem execução real:** Action/Workflow/Connector aparecem apenas como texto metadata (`{id} ({kind}) → {ref}`); nenhum `onClick`/`dispatch`/`start`/`execute`. Verificado por teste e gate.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:empresas-dev` | ✅ 24/24 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 533/533 PASS (509 baseline + 24 novos) |
| `npm run lint` | ✅ PASS, exit 0 (valida os `.jsx`) |
| `npm run build` | ✅ PASS, exit 0 (compila os `.jsx` via Vite) |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-empresas-dev` (new) | ✅ PASS 20/20 |
| `gate:g423-preview-empresas` (regression) | ✅ PASS 15/15 |
| `gate:g423-shadow-empresas-table-form` (regression) | ✅ PASS 13/13 |
| `gate:g423-shadow-empresas` (regression) | ✅ PASS 13/13 |
| `gate:g423-shadow` (regression) | ✅ PASS 13/13 |
| `gate:g423` (Foundation C master) | ✅ PASS 7/7 |
| `gate:g423-01`..`gate:g423-24` | ✅ all PASS |

---

## SSOT alterado

**Nenhum.**

## UI de produção alterada

**Nenhuma.**

## src/App.jsx alterado

**Não.**

## Menu principal alterado

**Não.**

## Runtime legado preservado

**Sim.**

## D-RI-13

**Preservado.** Nenhum arquivo em `preview/dev/` importa Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Integração visual dev-only com dados mockados ou segundo módulo piloto** — alimentar o preview dev-only com um preview model de dados mockados num harness dev isolado, ou aplicar o padrão a um segundo módulo. Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — poluição/opção inválida lançam `EmpresasDevPreviewError`; preview model inválido → fallback seguro; flag off por padrão; produção falha fechada.
- **Determinismo:** PASS — mesmo preview model produz o mesmo view model; diagnósticos são cópias seguras.
- **Opt-in/off switch:** PASS — desligado por padrão; componente renderiza `null` quando off.
- **Dev-only:** PASS — flag exige ambiente não-produção; override de produção explícito e documentado; sem rota/menu.
- **Sem side effects:** PASS — nunca executa action/workflow/connector, nunca salva, nunca chama backend.
- **Actions/workflows/connectors não executados:** PASS — apenas texto metadata; nenhum `onClick`/`dispatch`/`start`/`execute`. Verificado por teste e gate.
- **Dados sensíveis mascarados:** PASS — mascarados no view model.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 509 testes baseline intactos.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** dados mockados num harness dev, rota dev-only real, e integração visual em produção ficam explicitamente fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-empresas-dev-visual-preview/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega a prévia visual dev-only de Empresas: componentes React isolados que renderizam o view model runtime v2 (tabela/formulário/diagnostics/differences/metadata) apenas para desenvolvimento, opt-in, fail-closed em produção, sem montar em produção, sem rota/menu, sem executar ações reais, com fallback seguro para modelo inválido, mascaramento de dados sensíveis, e zero alteração de UI de produção, `src/App.jsx`, runtime legado, SSOT ou backend. 24 novos testes, 1 novo gate, zero regressão, zero dependência nova, zero CSS global novo.
