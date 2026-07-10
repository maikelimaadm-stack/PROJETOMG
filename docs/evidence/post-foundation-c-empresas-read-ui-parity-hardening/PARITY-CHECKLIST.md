# PARITY CHECKLIST — EMPRESAS READ UI PARITY HARDENING

Espelho legível de `createEmpresasReadUiParityChecklist()` com a flag ligada (overlay composto). 43 itens · 6 categorias · 42 pass · 1 warn · 0 fail → readiness `ready_for_next_slice` (99%).

| category | item | status | severity | evidence | remediation | blocking |
|---|---|---|---|---|---|---|
| estrutura | struct.moduleId — moduleId correto (empresas) | pass | high | moduleId=empresas | none | false |
| estrutura | struct.mode — mode correto (guarded_read_ui_overlay) | pass | medium | mode=guarded_read_ui_overlay | none | false |
| estrutura | struct.currentRuntime — currentRuntime legacy | pass | high | currentRuntime=legacy | none | false |
| estrutura | struct.targetRuntime — targetRuntime runtime-v2 | pass | medium | targetRuntime=runtime-v2 | none | false |
| estrutura | struct.rollback — rollback available | pass | high | rollbackStatus=available | none | false |
| estrutura | struct.nextStep — nextAllowedStep válido (Parity Hardening/Drift Resolution) | pass | medium | nextAllowedStep=Post-Foundation C — Empresas Read UI Parity Hardening | none | false |
| tabela | table.exists — table existe | pass | high | overlay.guardedReadUi.table | none | false |
| tabela | table.columns — columns existem | pass | high | columnCount=5 | none | false |
| tabela | table.visibleColumns — visibleColumns existem | pass | medium | visibleColumns=4 | none | false |
| tabela | table.visibleSubset — visibleColumns subset de columns | pass | medium | visibleColumns ⊆ columns | none | false |
| tabela | table.rowsControlled — rows usam fonte controlada/mock | pass | high | source=controlled-dev-dataset | none | false |
| tabela | table.rowShape — row shape estável e compatível com columns | warn | low | rows=3, stableShape=true, cells⊆columns=false | align table header columns with the controlled dataset column vocabulary in a later slice | false |
| tabela | table.labels — colunas possuem label/metadata | pass | low | column labels present | none | false |
| tabela | table.masked — dados sensíveis mascarados | pass | critical | no raw secret in overlay model | none | false |
| formulario | form.exists — form existe | pass | high | overlay.guardedReadUi.form | none | false |
| formulario | form.fields — fields existem | pass | high | fieldCount=7 | none | false |
| formulario | form.visibleFields — visibleFields existem | pass | medium | visibleFields=7 | none | false |
| formulario | form.visibleSubset — visibleFields subset de fields | pass | medium | visibleFields ⊆ fields | none | false |
| formulario | form.readOnly — fields renderizados readOnly/disabled | pass | critical | EmpresasGuardedReadForm renders readOnly + disabled inputs (write blocked) | none | false |
| formulario | form.required — required metadata preservada | pass | low | field.required present | none | false |
| formulario | form.validation — validation metadata preservada | pass | medium | validations=7 | none | false |
| formulario | form.permission — permission metadata preservada | pass | medium | permissions=7 | none | false |
| diagnostics | diag.parity — parityStatus presente | pass | medium | parityStatus=parity | none | false |
| diagnostics | diag.total — totalDifferences presente | pass | low | totalDifferences=0 | none | false |
| diagnostics | diag.blocking — blockingCount presente | pass | low | blockingCount=0 | none | false |
| diagnostics | diag.critical — criticalCount presente | pass | low | criticalCount=0 | none | false |
| diagnostics | diag.warnLimits — warnings/limitations presentes | pass | low | warnings + limitations arrays | none | false |
| diagnostics | diag.rollback — rollback status presente | pass | medium | rollbackStatus=available | none | false |
| seguranca | sec.writeBlocked — writeBlocked true | pass | critical | writeBlocked=true | none | false |
| seguranca | sec.blockedOps — blockedOperations completo | pass | high | blockedOperations=11 | none | false |
| seguranca | sec.writeProbe — create/update/delete/save bloqueados | pass | critical | writeGuard.attempt(...) → blocked | none | false |
| seguranca | sec.actionProbe — action/workflow/connector bloqueados | pass | critical | writeGuard.attempt(...) → blocked | none | false |
| seguranca | sec.noBackend — sem backend/fetch | pass | high | enforced by gate:g423-empresas-read-ui-parity-hardening + gate:g423-empresas-guarded-read-ui-overlay | none | false |
| seguranca | sec.noPrisma — sem Prisma/MMM direto (D-RI-13) | pass | high | enforced by gate:g423-empresas-read-ui-parity-hardening + gate:g423 | none | false |
| seguranca | sec.noStorage — sem storage externo | pass | medium | enforced by gate:g423-empresas-read-ui-parity-hardening | none | false |
| seguranca | sec.noCss — sem CSS global | pass | low | enforced by gate:g423-empresas-read-ui-parity-hardening | none | false |
| seguranca | sec.noDep — sem dependência nova | pass | low | enforced by gate:g423-empresas-read-ui-parity-hardening | none | false |
| seguranca | sec.noSideEffects — noSideEffects true | pass | high | noSideEffects=true | none | false |
| integracao-dev | devint.overlayOptIn — overlay opt-in | pass | medium | overlay flag matrix present | none | false |
| integracao-dev | devint.routeHubSafe — route/hub seguros | pass | medium | enforced by gate:g423-preview-route + gate:g423-preview-hub | none | false |
| integracao-dev | devint.appUntouched — App.jsx intocado | pass | critical | enforced by shared productionUiGuard (gate:g423-*) | none | false |
| integracao-dev | devint.menuUntouched — menu intocado | pass | high | enforced by productionUiGuard | none | false |
| integracao-dev | devint.realScreenUntouched — tela real Empresas intocada | pass | critical | enforced by productionUiGuard (src/modules) | none | false |

## Legenda

- **status:** `pass` (invariante confirmado) · `warn` (drift conhecido não-bloqueante) · `fail` (violação) · `skipped` (flag off).
- **severity:** `info` < `low` < `medium` < `high` < `critical`.
- **blocking:** `true` força `readinessStatus = blocked` e `nextAllowedStep = Hardening Fixes`.

## Observação sobre o warning

`tabela/table.rowShape` está em `warn` (low): o header da tabela usa as colunas do descriptor (`codempresa`, `razao_social`, `cpf_cnpj`, `status`, `inscricao_estadual`) enquanto as linhas controladas carregam o vocabulário de colunas do controlled dataset (`razao_social`, `nome_fantasia`, `cnpj`, `cidade`, `uf`, `ativo`). É um drift de vocabulário conhecido do dev-preview, não uma questão de segurança — a resolver em um slice futuro. O row shape em si é **estável** (todas as linhas têm as mesmas chaves).
