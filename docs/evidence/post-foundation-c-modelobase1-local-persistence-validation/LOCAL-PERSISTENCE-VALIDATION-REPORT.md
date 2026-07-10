# LOCAL PERSISTENCE VALIDATION REPORT

## Objetivo
Validar a fundação de persistência local controlada (in-memory) dos drafts beta do ModeloBase1 — sem backend/Prisma/schema/fetch/storage real.

## Flags
- `MAK_MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION` (umbrella)
- `MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION`
- `MAK_MODELOBASE1_CADCPS_LOCAL_PERSISTENCE_VALIDATION`

Off por padrão; **só liga** com beta + local write plan + local write activation + validation flag; fail-closed em produção salvo `*_ALLOW_PROD`.

## Adapter
`createModeloBase1LocalPersistenceAdapter` — in-memory (Map), injetável, determinístico. Operações: saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot, clearModuleSnapshots, getDiagnostics. Sem localStorage/IndexedDB/backend/Prisma/fetch.

## storageMode
`memory_validation` (padrão) e `injected_adapter_validation`. **Nunca** storage real; `mandatoryStorage:false`.

## Snapshot lifecycle
serialize (draft → snapshot plano + checksum) → validate (fail-closed) → adapter.save (opcional) → load → rehydrate (→ draft seguro) → clear/rollback. Reset/rollback recompõem do read model original.

## Diagnostics
`createModeloBase1LocalPersistenceDiagnostics` — moduleId, enabled, storageMode, localOnly, persistenceReal:false, snapshotCount, validationStatus, rehydrateStatus, backend/prisma/runtimeBridge Touched:false, fallbackAvailable, rollbackAvailable, genericModelReady, next.

## Fallback
Flag off / activation off → sem contract/adapter na UI; comportamento anterior. Snapshot inválido → rehydrate falha (sem quebrar).

## Rollback
Flag off / clear snapshots / rehydrate do read model original. Sem schema, sem persistência real a desfazer.

## Limitations
- **Validation-only:** nenhuma persistência real; adapter é in-memory (vive na instância).
- **UI sem auto-save/auto-restore:** a página só mostra um painel dev-only de contract/diagnostics; nunca chama o adapter.
- cadcps usa o mesmo contrato/adapter/base.

## Próximo passo recomendado
**Generic Model Runtime Extraction Audit** — avaliar a extração da fundação para todos os modelos MAK.
