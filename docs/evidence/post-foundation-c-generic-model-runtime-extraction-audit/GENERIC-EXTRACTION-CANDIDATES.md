# GENERIC EXTRACTION CANDIDATES

Classificação de cada artefato provado no ModeloBase1. Categorias:
**A** Generic Kernel Candidate · **B** ModeloBase1 Adapter · **C** Module Adapter · **D** Future Studio/Marketplace Contract.

Genericidade: 🟢 alta (quase zero acoplamento) · 🟡 média (renomear/parametrizar) · 🔴 baixa (específico).

## A — Generic Kernel Candidate (extrair para `src/runtime/generic-model/`)

| Artefato | Path atual | Genericidade | Acoplamento | Risco | Recomendação | Destino futuro |
|---|---|---|---|---|---|---|
| `safety.js` (isPlainObject/findUnsafeContent/hasUnmaskedSensitive/hasForbiddenReference/safeClone) | `runtime-read-model/safety.js` | 🟢 | nenhum | baixo | **extrair 1º** | `generic-model/safety/` |
| Fallback state builder | `modeloBase1RuntimeReadFallback.js` | 🟢 | nome | baixo | **extrair 1º** | `generic-model/fallback/` |
| Diagnostics builder (read) | `createModeloBase1RuntimeReadDiagnostics.js` | 🟡 | nome/campos MB1 | baixo | extrair (parametrizar) | `generic-model/diagnostics/` |
| Descriptor + payload validation | `validateModeloBase1RuntimeReadModel.js` | 🟡 | nome; contrato read-only | médio | extrair (contrato genérico) | `generic-model/read/` |
| Write payload validation | `local-write/validateModeloBase1LocalWritePayload.js` | 🟢 | nome | baixo | **extrair 1º** | `generic-model/write/` |
| Local write mutation (rows) | `local-write/applyModeloBase1LocalWriteMutation.js` | 🟢 | shape table.rows | baixo | extrair | `generic-model/write/` |
| Local write controller | `local-write/createModeloBase1LocalWriteController.js` | 🟢 | shape read state | baixo | extrair | `generic-model/write/` |
| Local write contract | `local-write/createModeloBase1LocalWriteContract.js` | 🟢 | nome | baixo | extrair | `generic-model/write/` |
| Persistence contract | `persistence/createModeloBase1LocalPersistenceContract.js` | 🟢 | nome | baixo | extrair | `generic-model/persistence/` |
| In-memory adapter | `persistence/createModeloBase1LocalPersistenceAdapter.js` | 🟢 | nenhum | baixo | **extrair 1º** | `generic-model/persistence/` |
| Serialize + checksum | `persistence/serializeModeloBase1LocalDraft.js` | 🟢 | shape draft | baixo | extrair | `generic-model/persistence/` |
| Rehydrate | `persistence/rehydrateModeloBase1LocalDraft.js` | 🟢 | shape draft | baixo | extrair | `generic-model/persistence/` |
| Snapshot validation | `persistence/validateModeloBase1LocalDraftSnapshot.js` | 🟢 | source const | baixo | extrair | `generic-model/persistence/` |
| Draft versioning | `persistence/createModeloBase1LocalDraftVersion.js` | 🟢 | nenhum | baixo | **extrair 1º** | `generic-model/persistence/` |
| Typed error pattern | `errors.js` (×4) | 🟢 | códigos por camada | baixo | extrair (fábrica genérica) | `generic-model/errors/` |

## B — ModeloBase1 Adapter (permanece em `src/ModeloBase1/`, vira adapter fino)

| Artefato | Path atual | Genericidade | Acoplamento | Recomendação |
|---|---|---|---|---|
| Injection point resolver | `resolveModeloBase1RuntimeReadModel.js` | 🔴 | lê `config.runtimeReadModel` do ModeloBase1 | manter específico (adapter) |
| Apply orchestration | `applyModeloBase1RuntimeReadModel.js` | 🟡 | shape read state MB1 | refatorar → chama kernel |
| React hooks | `useModeloBase1RuntimeReadModel.js`, `useModeloBase1ControlledLocalWrite.js` | 🔴 | React + shape MB1 | manter específico (adapter) |
| Local write session | `createModeloBase1LocalWriteUiState.js` (session) | 🟡 | shape read state MB1 | refatorar → usa kernel controller |
| Activation resolver + configs | `resolveModeloBase1LocalWriteActivation.js`, `modeloBase1LocalWriteConfig.js`, `modeloBase1BetaUiConfig.js`, `modeloBase1LocalPersistenceConfig.js` | 🔴 | flags `MAK_MODELOBASE1_*` | manter específico (flag namespace por modelo) |
| Beta UI hardening | `hardening/*` | 🟡 | categorias table/form MB1 | extrair core, manter categorias MB1 |
| Todos os componentes `.jsx` | `components/*`, `.../components/*` | 🔴 | UI ModeloBase1 | manter específico (adapter UI) |

## C — Module Adapter (permanece em `src/modules/*`)

| Artefato | Path atual | Recomendação |
|---|---|---|
| `empresasModeloBase1Config.js` / `cadcpsModeloBase1Config.js` | `src/modules/*/config/` | manter — injeta read model por moduleId/flag |
| Read model source beta | `src/runtime/modelobase1-direct-beta/*` | manter — fonte por módulo (Empresas/cadcps) + controlled dataset + write guard |
| moduleId, per-module flags, fields/columns | vários | manter — específico do módulo |

## D — Future Studio/Marketplace Contract (só documentar — ver STUDIO-MARKETPLACE-COMPATIBILITY.md)

| Contrato futuro | Origem no que já existe |
|---|---|
| Model Package Contract | contrato read + write + persistence combinados |
| Template Contract | config declarativa (fields/columns/actions/validations) |
| Published Module Contract | moduleId + version + capability gates + safety policy |
| Permission/Validation/Workflow Contract | fields.permission/validation + (futuro) workflow |
| Offline Persistence Policy | persistence contract + storageMode + versioning |

## Resumo

- **Extrair primeiro (🟢, zero-coupling):** safety, fallback, in-memory adapter, versioning, write payload validation, typed-error factory.
- **Extrair na sequência (parametrizar):** contratos (read/write/persistence), controller, mutation, serialize/rehydrate/validate, diagnostics.
- **Manter como adapter ModeloBase1 (🔴):** hooks React, injection resolver, flag configs, componentes UI, categorias de hardening.
- **Manter como module adapter (C):** module configs + read model source + flags por módulo.
