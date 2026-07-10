# CURRENT MODELOBASE1 RUNTIME MAP

Mapa completo do que existe hoje na cadeia beta do ModeloBase1 (pós-Foundation C), provado em 6 slices mergeados: **Direct Beta → Runtime Wiring → Beta UI Hardening → Local Write Plan → Local Write Activation → Local Persistence Validation**.

## Visão geral por camada

| Camada | Dir | Arquivos | Papel |
|---|---|---|---|
| Read model source (runtime v2) | `src/runtime/modelobase1-direct-beta/` | 8 | Produz o read model beta injetável (`config.runtimeReadModel`) para Empresas/cadcps |
| Runtime read (consumo) | `src/ModeloBase1/runtime-read-model/` | 9 | Detecta/valida/resolve/aplica o read model; fallback; diagnostics; hook |
| Beta UI hardening | `.../hardening/` | 5 | Checklist/diagnostics/config dev-only sobre o read state |
| Controlled local write | `.../local-write/` | 12 | Contrato/controller/validação/mutação/activation/session/hook + componentes |
| Local persistence validation | `.../local-write/persistence/` | 9 | Contrato/adapter/serialize/rehydrate/validate/version/diagnostics + componentes |
| Module adapters | `src/modules/empresas/config/modeloBase1/`, `src/modules/cadcps/config/` | — | Injetam o read model beta atrás de flag |
| Engine consumer | `src/ModeloBase1/render/ModeloBase1CadastroPage.jsx` | 1 | Consome o hook + toolbar/painéis dev-only |

## Runtime Read

- `resolveModeloBase1RuntimeReadModel.js` — lê `config.runtimeReadModel` (ponto de injeção).
- `validateModeloBase1RuntimeReadModel.js` — valida descritor (read-only/write-blocked) + payload resolvido (pureza/máscara).
- `applyModeloBase1RuntimeReadModel.js` — orquestra detect→validate→resolve→apply, ou fallback.
- `createModeloBase1RuntimeReadDiagnostics.js` — diagnostics passivos.
- `modeloBase1RuntimeReadFallback.js` — estado de fallback canônico.
- `safety.js` — helpers puros locais (isPlainObject/findUnsafeContent/hasUnmaskedSensitive/hasForbiddenReference/safeClone).
- `useModeloBase1RuntimeReadModel.js` — hook React (apply + fallback).
- `types.js`, `errors.js`.
- **Consumo:** `ModeloBase1CadastroPage` → `useModeloBase1RuntimeReadModel(config)` → write-block + banner.

## Beta UI Hardening

- `createModeloBase1BetaUiChecklist.js` — checklist structure/table/form/diagnostics/security/scope.
- `createModeloBase1BetaUiHardeningModel.js` — modelo top-level + `...FromConfig`.
- `modeloBase1BetaUiDiagnostics.js` — readiness (`hardened`/`fallback`/`needs_fixes`).
- `modeloBase1BetaUiConfig.js` — flag dev-only de diagnostics.
- Componentes (na camada read): `ModeloBase1RuntimeReadDiagnosticsPanel/FallbackBadge/WriteBlockedBadge`.

## Controlled Local Write

- `createModeloBase1LocalWriteContract.js` — allowed/blocked operations.
- `createModeloBase1LocalWriteController.js` — controller in-memory sobre cópia segura.
- `validateModeloBase1LocalWritePayload.js` — payload fail-closed.
- `applyModeloBase1LocalWriteMutation.js` — createRow/updateRow/deleteRow/saveDraft/submitDraft puros.
- `modeloBase1LocalWriteConfig.js` — flags plan.
- `resolveModeloBase1LocalWriteActivation.js` — flags activation + resolução (beta+plan+activation).
- `createModeloBase1LocalWriteUiState.js` — UI state puro + session headless.
- `useModeloBase1ControlledLocalWrite.js` — hook React.
- `modeloBase1LocalWriteDiagnostics.js`, `modeloBase1LocalWriteActivationDiagnostics.js`, `errors.js`.
- Componentes: `ModeloBase1LocalWriteToolbar/DiagnosticsPanel/PlanPanel/StatusBadge/LocalDraftBadge`.

## Local Persistence Validation

- `createModeloBase1LocalPersistenceContract.js` — contrato + `genericModelReady`.
- `createModeloBase1LocalPersistenceAdapter.js` — adapter in-memory injetável.
- `serializeModeloBase1LocalDraft.js` — snapshot + checksum FNV-1a + masking.
- `rehydrateModeloBase1LocalDraft.js` — reidratação segura.
- `validateModeloBase1LocalDraftSnapshot.js` — validação fail-closed.
- `createModeloBase1LocalDraftVersion.js` — versionamento determinístico.
- `modeloBase1LocalPersistenceDiagnostics.js`, `modeloBase1LocalPersistenceConfig.js`, `errors.js`.
- Componentes: `ModeloBase1LocalPersistencePanel/Badge`.

## Module Adapters (Empresas / cadcps)

- `empresasModeloBase1Config.js` / `cadcpsModeloBase1Config.js` — passam `runtimeReadModel` atrás de flag.
- Read model source: `src/runtime/modelobase1-direct-beta/createEmpresas...` / `createCadcps...` + controlled dataset + write guard.
- Diferença entre Empresas e cadcps: **apenas** `moduleId`, config, read model source e flags. Mesmo engine/hook/controller/contrato base.

## Invariantes provadas

- Flags off por padrão, fail-closed em produção, cadeia beta→plan→activation→validation.
- Fallback seguro em todos os pontos; tela nunca quebra.
- `localOnly:true`, `persistenceReal:false`, `backend/prisma/runtimeBridge Touched:false`, `submitDraft.sent:false`.
- Original nunca mutado; cópias seguras; determinismo.
- Módulos `runtime-read-model/*` **não importam** `src/runtime` (desacoplados).
- `test:runtime` 1263 PASS; 6 gates g423 verdes.

## Diagrama

```mermaid
flowchart TD
  SRC["runtime v2 read model source (modelobase1-direct-beta)"] --> CFG["module config (empresas/cadcps) injects runtimeReadModel"]
  CFG --> PAGE["ModeloBase1CadastroPage"]
  PAGE --> READ["useModeloBase1RuntimeReadModel → apply/validate/fallback"]
  READ --> HARD["Beta UI Hardening (checklist/diagnostics)"]
  READ --> LW["Controlled Local Write (contract/controller/activation)"]
  LW --> LD["Local Draft (in-memory, safe copy)"]
  LD --> PERS["Local Persistence Validation (serialize/validate/rehydrate/adapter)"]
  PERS --> SNAP["Snapshot (+checksum, localOnly, persistenceReal:false)"]
  READ -. safety.js (pure) .- HARD
  READ -. safety.js (pure) .- LW
  LW -. safety.js (pure) .- PERS
```
