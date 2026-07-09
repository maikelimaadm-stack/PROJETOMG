# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Empresas Controlled Preview Sandbox
**Branch:** `claude/post-foundation-c-empresas-controlled-preview`
**Base:** `main` @ `e4f08468` (post Empresas Table/Form Shadow Projection merge)
**Gates:** G423-PREVIEW-EMPRESAS (PASS 15/15) · G423-SHADOW-EMPRESAS-TABLE-FORM (PASS 13/13) · G423-SHADOW-EMPRESAS (PASS 13/13) · G423-SHADOW (PASS 13/13) · G423 master (PASS 7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/preview/controlledPreview.js` | `ControlledPreview` — `isEnabled()`, `createPreviewModel()`, `run()`, `getDiagnostics()`, `clear()`, `createControlledPreview()` |
| `src/runtime/preview/previewModel.js` | Pure `createPreviewModel(projection, options)` — transforms a table/form projection into an isolated plain-object preview model + diagnostics |
| `src/runtime/preview/errors.js` | `ControlledPreviewError` (`MAK-L3-PREVIEW-001`..`002`) |
| `src/runtime/types/preview.js` | JSDoc types (`PreviewModel`, `PreviewTable`, `PreviewForm`, `PreviewField`, `PreviewDiagnostics`, `ControlledPreviewReport`) |
| `src/runtime/__tests__/preview/empresas-controlled-preview.test.js` | 28 tests — opt-in default-off, preview model table/form, deterministic columns/fields, labels/validation/permission preserved, actions/workflows metadata-only, not-a-React-element, no-DOM/no-backend/no-Prisma, masking, prototype-pollution guard, diagnostics safety, projection-failure capture, Observability integration |
| `scripts/gates/g423-empresas-controlled-preview.mjs` | Gate G423-PREVIEW-EMPRESAS |
| `docs/evidence/post-foundation-c-empresas-controlled-preview/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-empresas-controlled-preview/MODULE-DIAGRAMS.md` | Mermaid — preview position and flow |
| `docs/evidence/post-foundation-c-empresas-controlled-preview/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports `createControlledPreview`, `ControlledPreview`, `ControlledPreviewError`, `createPreviewModel`. |
| `package.json` | Added `test:runtime:preview:empresas`, `gate:g423-preview-empresas`; appended the preview test to the aggregated `test:runtime`. |

**Nenhum arquivo de UI de produção** (`src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`), **nenhuma rota pública**, **nenhum arquivo SSOT**, e **o runtime legado** foram tocados. `src/App.jsx` intocado — confirmado por `git diff` e pelo gate.

**Desacoplamento:** o preview não importa `src/modules/empresas/*`, `src/App.jsx`, nem cria rota. Reutiliza os guards puros de `tableFormProjection.js` (`validateProjectionInput`/`redactSensitive`/`safeClone`).

**Nota de código de erro:** o guard compartilhado `validateProjectionInput` carrega a string de código do slice anterior (`MAK-L3-SHADOW-PILOT-001`); o preview remapeia via a fábrica `makeError` para `MAK-L3-PREVIEW-001`, mantendo códigos de erro próprios sem alterar o helper compartilhado (na main).

---

## O que foi implementado

`ControlledPreview` transforma a projeção table/form runtime v2 do módulo Empresas em um **preview model** isolado, de objeto plano — para validação e diagnóstico apenas. Nunca monta um preview real, nunca renderiza no DOM de produção, nunca cria rota pública, nunca executa action/workflow/connector, nunca salva dados, nunca chama backend.

- **`isEnabled()`** — flag opt-in (`options.enabled` explícito, ou env `MAK_RUNTIME_V2_EMPRESAS_CONTROLLED_PREVIEW === 'true'`, senão desligado).
- **`createPreviewModel(projection, options)`** — transforma puramente uma projeção `{table, form, meta}` num preview model determinístico; retorna cópia profunda segura.
- **`run(input)`** — desligado retorna `{ skipped: true }`; ligado constrói a projeção v2 (via `EmpresasTableFormShadow` interno), transforma no preview model, anexa as diferenças da comparação legado↔v2 aos diagnostics, e **captura qualquer falha da projeção em `{ ok: false, error }`**, nunca propagando para a tela.
- **`getDiagnostics()` / `clear()`** — cópia profunda segura / reset.

### Preview Model — tabela

`{ columns:[{id,label,sortable,filterable,visible}], visibleColumns, headerLabels, cellMetadata, rowActions }` — `rowActions` são metadados apenas, nunca despachados.

### Preview Model — formulário

`{ fields:[{id,label,type,required,permission,permitted,denied,validation}], visibleFields, sections, formActions, formWorkflows }` — `formActions`/`formWorkflows` são metadados apenas, nunca executados.

### Preview Model — diagnostics

`{ warnings, differences, deniedFields, missingLabels, invalidMetadata, unsupportedFeatures }` — `differences` vêm da comparação legado↔v2 do slice anterior; `deniedFields` dos campos negados por M09; `missingLabels` de colunas/campos sem label explícito; `unsupportedFeatures` sinaliza workflows como metadata-only.

**Modelo de falha de duas camadas:** input com poluição de protótipo/profundidade ou opção inválida **lançam** `ControlledPreviewError`; falha da projeção subjacente é **capturada e retornada** no relatório, nunca propagada.

**Preview model é objeto plano** — não é DOM, não é React element (`$$typeof` ausente, `JSON.stringify` seguro), marcado com `kind: 'preview-model'` e `isPreviewModel: true`.

## Integração

- **EmpresasTableFormShadow:** o preview constrói a projeção v2 (e a comparação legado↔v2) via um `EmpresasTableFormShadow` interno (opt-in ligado), depois a transforma no preview model.
- **Observability (M24):** injetável — grava `preview.empresas.warnings` e `captureError()` em falha.
- **Sem execução real:** Action/Workflow/Connector aparecem apenas como metadados — nunca invocados. Verificado por teste e gate.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:empresas` | ✅ 28/28 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 509/509 PASS (481 baseline + 28 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-empresas` (new) | ✅ PASS 15/15 |
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

## Runtime legado preservado

**Sim.**

## D-RI-13

**Preservado.** Nem `controlledPreview.js` nem `previewModel.js` importam Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Preview visual dev-only ou segundo módulo piloto** — montar o preview model num componente visual dev-only (fora de produção, feature-flagged), ou aplicar o preview controlado a um segundo módulo. Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — input inválido/poluição lançam `ControlledPreviewError`; falha da projeção sempre capturada como dado, nunca propagada.
- **Determinismo:** PASS — preview model é determinístico para a mesma projeção; clock injetável; diagnósticos são cópias profundas.
- **Opt-in/off switch:** PASS — desligado por padrão; `run()` desligado é no-op com zero diagnósticos e nenhum preview model; `clear()` disponível.
- **Preview model sem DOM/React real:** PASS — objeto plano serializável, sem `$$typeof`, sem `document`/`window`/`createElement`.
- **Actions/workflows/connectors não executados:** PASS — apenas metadados `{id, kind, ref}`; verificado por teste e gate.
- **Dados sensíveis mascarados:** PASS — mascarados no preview model e diagnósticos.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 481 testes baseline intactos.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** preview visual real, rota dev-only, e execução de ações reais ficam explicitamente fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-empresas-controlled-preview/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega o preview controlado do módulo Empresas: transforma a projeção table/form runtime v2 num preview model isolado de objeto plano (tabela + formulário + diagnostics), sem DOM/React real, sem rota pública, sem side effect, sem executar ações reais, com isolamento de falhas, mascaramento de dados sensíveis, e zero alteração de UI de produção, `src/App.jsx`, runtime legado, SSOT ou backend. 28 novos testes, 1 novo gate, zero regressão.
