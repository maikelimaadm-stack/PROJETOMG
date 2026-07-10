# PERSISTENCE ADAPTER FOUNDATION

## In-memory adapter
`createGenericModelInMemoryAdapter({ storageMode })` — Map em memória, injetável, determinístico. Operações: `saveSnapshot`, `loadSnapshot`, `listSnapshots(filter)`, `deleteSnapshot`, `clearSnapshots(filter)`, `getDiagnostics`. Filtra por `moduleId`/`modelId`. Nunca muta a entrada; toda leitura retorna cópia segura.

## Snapshot
`createGenericModelSnapshot({ modelId, moduleId, modelType, data, draftVersion, clock })` — sanitiza (dropa função/React, mascara sensível, remove pollution), estampa `version/schemaVersion/source/localOnly:true/persistenceReal:false` + checksum. Retorna snapshot OU erro estruturado (`generic-model-error`) se os dados forem inseguros.

Shape: `{ kind, snapshotId, modelId, moduleId, modelType, version, schemaVersion, source, localOnly, persistenceReal, data, metadata, diagnostics, checksum }`.

## Validation
`validateGenericModelSnapshot({ snapshot, moduleId, modelId })` — fail-closed: moduleId/modelId mismatch, função/React/pollution, chave-alvo forbidden nos dados, `localOnly!==true`, `persistenceReal!==false`, checksum mismatch → inválido.

## Versioning
`createGenericModelVersion` — determinístico; `versionId=gmv-<modelId>-<moduleId>-<schemaVersion>-<draftVersion>`; `createdAt` de clock injetável (default fixo, sem `Date.now`).

## Checksum
`createGenericModelChecksum` — FNV-1a determinístico (`fnv1a-xxxxxxxx`), sem crypto externo; funções/undefined são dropados pelo JSON.

## storageMode
`memory_validation` (padrão) e `injected_adapter_validation`. **Nunca** storage real; `mandatoryStorage:false`.

## localOnly / persistenceReal
Todo resultado/adaptador/snapshot: `localOnly:true`, `persistenceReal:false`, `backend/prisma/runtimeBridge Touched:false`.
