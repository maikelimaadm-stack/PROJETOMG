# SNAPSHOT SERIALIZATION REPORT

`serializeModeloBase1LocalDraft({ moduleId, localDraft|localRows, formState, draftVersion, clock })` — puro, não muta a entrada.

## snapshot shape
```
{ kind:'modelobase1-local-draft-snapshot', snapshotId, moduleId, version, schemaVersion,
  source:'modeloBase1-local-write', localOnly:true, persistenceReal:false,
  rows, form, metadata:{ createdAt, rowCount, origin, draftVersion }, diagnostics, checksum }
```

## version / schemaVersion
`version` = `v-<moduleId>-<schemaVersion>-<draftVersion>` (determinístico). `schemaVersion` = 1 (constante `MODELOBASE1_LOCAL_DRAFT_SCHEMA_VERSION`).

## localOnly / persistenceReal
`localOnly:true`, `persistenceReal:false` (estampados no snapshot e no checksum content).

## masking
Chaves sensíveis (`/password|token|secret|api[-_]?key|authorization|cookie|credential/i`) → `[REDACTED]` antes do checksum.

## prototype pollution protection
`findUnsafeContent` rejeita `__proto__`/`constructor`/`prototype`, funções/handlers e React elements na origem → lança `MAK-MB1-LP-003`/`002`.

## checksum/hash
`computeModeloBase1DraftChecksum` — FNV-1a determinístico (8-hex, prefixo `fnv1a-`), sobre o conteúdo canônico (moduleId/version/schemaVersion/source/localOnly/persistenceReal/rows/form). Sem crypto externo. Detecta adulteração (validação recomputa e compara).
