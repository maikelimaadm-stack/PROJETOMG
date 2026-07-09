# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Empresas Table/Form Shadow Projection
**Branch:** `claude/post-foundation-c-empresas-table-form-shadow`
**Base:** `main` @ `7f8d2dcd` (post Empresas Shadow Pilot merge)
**Gates:** G423-SHADOW-EMPRESAS-TABLE-FORM (PASS 13/13) · G423-SHADOW-EMPRESAS (PASS 13/13) · G423-SHADOW (PASS 13/13) · G423 master (PASS 7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/shadow/pilots/empresasTableFormShadow.js` | `EmpresasTableFormShadow` — `isEnabled()`, `createLegacyTableFormSnapshot()`, `createRuntimeV2TableFormProjection()`, `compareTableForm()`, `run()`, `getDiagnostics()`, `clear()`, `createEmpresasTableFormShadow()`, `EMPRESAS_TABLE_FORM_DESCRIPTOR` |
| `src/runtime/shadow/pilots/tableFormProjection.js` | Pure projection helpers — `projectTable()`, `projectForm()`, `buildRenderTree()`, `createTableFormProjection()`, plus shared guards (`validateProjectionInput`, `redactSensitive`, `safeClone`, `isPlainObject`) |
| `src/runtime/types/shadow-table-form.js` | JSDoc types (`TableFormDescriptor`, `TableProjection`, `FormProjection`, `ShadowRenderNode`, `TableFormProjectionResult`, `EmpresasTableFormShadowReport`) |
| `src/runtime/__tests__/shadow/empresas-table-form-shadow.test.js` | 24 tests — opt-in default-off, deterministic table/form projection, validation/permission metadata, actions/workflows as metadata-only, intermediate render tree, controlled comparison, diagnostics safety, masking, prototype-pollution guard, failure capture, no-DOM/no-backend/no-Prisma, RuntimeShadowMode + Observability integration |
| `scripts/gates/g423-shadow-empresas-table-form.mjs` | Gate G423-SHADOW-EMPRESAS-TABLE-FORM |
| `docs/evidence/post-foundation-c-empresas-table-form-shadow/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-empresas-table-form-shadow/MODULE-DIAGRAMS.md` | Mermaid — projection position and flow |
| `docs/evidence/post-foundation-c-empresas-table-form-shadow/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports `createEmpresasTableFormShadow`, `EmpresasTableFormShadow`, `createTableFormProjection`. |
| `package.json` | Added `test:runtime:shadow:empresas-table-form`, `gate:g423-shadow-empresas-table-form`; appended the projection test to the aggregated `test:runtime`. |

**Decisão sobre `test:runtime`:** o teste da projeção FOI incluído no `test:runtime` agregado (mesmo padrão dos slices anteriores). O gate próprio permanece separado (não faz parte do master `gate:g423`).

**Erro reutilizado (sem duplicação):** o slice reutiliza `EmpresasShadowPilotError` (de `shadow/pilots/errors.js`) com os códigos existentes `MAK-L3-SHADOW-PILOT-001` (input inválido/poluição) e `MAK-L3-SHADOW-PILOT-002` (opção inválida) — conforme instruído ("se já existir, reutilizar sem duplicar erro desnecessário"). Nenhum novo módulo de erro foi criado.

**Nenhum arquivo de UI de produção** (`src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`) foi tocado — confirmado por `git diff` e pelo gate. **Nenhum arquivo SSOT** foi tocado. **O runtime legado** foi apenas lido para descoberta.

**Decisão de desacoplamento:** a projeção NÃO importa `src/modules/empresas/*` nem `src/App.jsx`. Ela embarca um descritor estrutural canônico de table/form do módulo Empresas (`EMPRESAS_TABLE_FORM_DESCRIPTOR`) e aceita `input` do chamador para sobrescrever — verificado por teste e gate.

---

## O que foi implementado

`EmpresasTableFormShadow` produz uma representação **intermediária** runtime v2 da tabela e do formulário do módulo Empresas — colunas, campos, metadados de validação, metadados de permissão, e ações/workflows **apenas como metadados** — e a compara contra um snapshot estrutural legado, gerando diagnósticos de divergência. Nunca renderiza UI real (sem DOM/React), nunca executa action/workflow/connector, nunca toca dados, nunca chama backend.

- **`isEnabled()`** — flag opt-in (`options.enabled` explícito, ou env `MAK_RUNTIME_V2_SHADOW_EMPRESAS_TABLE_FORM === 'true'`, senão desligado).
- **`createLegacyTableFormSnapshot(input)`** — projeção legado (tipos crus, sem filtro de permissão).
- **`createRuntimeV2TableFormProjection(input)`** — projeção v2: tipos canonicalizados (`tel→phone`, `cpf_cnpj→document`, `text→string`), permissões aplicadas via M09 quando injetado, metadados de validação anexados.
- **`compareTableForm(legacy, v2)`** — comparação estrutural determinística via `RuntimeShadowMode` (mascarada, com guarda de poluição), excluindo o marcador `runtime`.
- **`run(input)`** — desligado retorna `{ skipped: true }`; ligado orquestra snapshot+projeção+comparação, grava diagnósticos, e **captura qualquer falha (Render/Permission/Validation/comparação) em `{ ok: false, error }`**, nunca propagando para a tela.
- **`getDiagnostics()` / `clear()`** — cópia profunda segura / reset.

### Projeção de tabela (`projectTable`)

`{ columns: [{id, label, sortable, filterable, visible}], visibleColumns: [ids], actions: [{id, kind, ref}] }` — colunas ordenadas por id; `actions` são **metadados apenas**, nunca despachadas.

### Projeção de formulário (`projectForm`)

`{ fields: [{id, label, type, required, permission, permitted, denied, validation:{rules, source}}], visibleFields, permissionsApplied, actions, workflows }` — campos ordenados por id; quando M09 é injetado, campos com `permission` são marcados `permitted`/`denied` (deny **filtra** `visibleFields`); `actions`/`workflows` são metadados apenas, nunca executados.

### Render tree intermediária (`buildRenderTree`)

`{ type:'view', component:'TableFormView', intermediate:true, children:[ {type:'table',...}, {type:'form',...} ] }` — objetos planos serializáveis, sem nó DOM, sem elemento React.

**Modelo de falha de duas camadas:** input com poluição de protótipo/profundidade ou opção inválida **lançam** `EmpresasShadowPilotError`; falha da integração de engine (ex.: `permissionEngine.can` lança) é **capturada e retornada** no relatório, nunca propagada.

## Integração

- **Render Engine (M12):** a projeção segue o mesmo contrato do RenderEngine — `actionRef`/`workflowRef` como metadados apenas (o RenderEngine "never dispatches it"); a render tree é intermediária, exatamente como o `RenderTree` do M12. Um `renderEngine` injetado é marcado (`renderEngineWired`) sem forçar hidratação de CRB.
- **Permission Engine (M09):** injetável — `can('read', permission, context)` marca/filtra campos negados. Nunca reimplementa a decisão de permissão.
- **Validation Engine (M15):** metadados de validação derivados do descritor (`rules`), com hook opcional `describeFieldRules(fieldId)` quando um validationEngine com essa capacidade é injetado.
- **RuntimeShadowMode:** usado para `compareTableForm` (comparação mascarada, com guarda de poluição) — satisfaz "integra com EmpresasShadowPilot ou RuntimeShadowMode".
- **Observability (M24):** injetável — grava `shadow.empresas_table_form.differences` e `captureError()` em falha.
- **Sem execução real:** Action/Workflow/Connector nunca invocados — apenas metadados. Verificado por teste e gate.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:shadow:empresas-table-form` | ✅ 24/24 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 481/481 PASS (457 baseline + 24 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-shadow-empresas-table-form` (new) | ✅ PASS 13/13 |
| `gate:g423-shadow-empresas` (regression) | ✅ PASS 13/13 |
| `gate:g423-shadow` (regression) | ✅ PASS 13/13 |
| `gate:g423` (Foundation C master) | ✅ PASS 7/7 |
| `gate:g423-01`..`gate:g423-24` | ✅ all PASS |

---

## SSOT alterado

**Nenhum.**

## UI de produção alterada

**Nenhuma.** `src/App.jsx` intocado.

## Runtime legado preservado

**Sim.** A tela Empresas continua servida exclusivamente pelo runtime legado.

## D-RI-13

**Preservado.** Nem `empresasTableFormShadow.js` nem `tableFormProjection.js` importam Prisma/backend/MMM. Verificado por teste, pelo gate, e pelo master gate G423.

## Próximo passo

**Table/form preview controlado ou segundo módulo piloto** — evoluir para um preview visual controlado (ainda passivo, feature-flagged) da projeção, ou aplicar o mesmo padrão de projeção shadow a um segundo módulo. Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — input inválido/poluição lançam `EmpresasShadowPilotError`; falha de engine sempre capturada como dado, nunca propagada para a UI.
- **Determinismo:** PASS — projeções ordenam colunas/campos por id e produzem o mesmo resultado para a mesma entrada; clock injetável; diagnósticos são cópias profundas.
- **Opt-in/off switch:** PASS — desligado por padrão; `run()` desligado é no-op com zero diagnósticos e nenhuma projeção construída; `clear()` disponível.
- **Render intermediário sem DOM/React real:** PASS — render tree é objeto plano serializável; nenhuma importação de react/react-dom, nenhum acesso a document/window/createElement.
- **Actions/workflows/connectors não executados:** PASS — presentes apenas como metadados `{id, kind, ref}`; nenhuma função de execução; verificado por teste e gate.
- **Dados sensíveis mascarados:** PASS — mascarados nos snapshots e diagnósticos.
- **Runtime legado preservado:** PASS — tela Empresas inalterada.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 457 testes baseline intactos.
- **D-RI-13:** PASS — ver acima.
- **Débitos técnicos controlados:** preview visual controlado, uso das definições vivas de table/form em runtime, e reconciliação semântica profunda ficam explicitamente fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-empresas-table-form-shadow/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega a projeção shadow de table/form do módulo Empresas: representação intermediária runtime v2 (colunas, campos, validação, permissão, ações/workflows como metadados), comparação determinística legado↔v2 via RuntimeShadowMode, render tree intermediária sem DOM/React, isolamento de falhas de engine, mascaramento de dados sensíveis, e zero alteração de UI de produção, `src/App.jsx`, runtime legado, SSOT ou backend. 24 novos testes, 1 novo gate, zero regressão.
