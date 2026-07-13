# Draft → Normalize → Validate Pipeline

## Draft
`createStudioDraftBlueprint(options)` produz um objeto `studio-draft-blueprint` com
`state: 'draft'`, campos/telas/permissões/persistência/runtimeBinding saneados, e um
`draftDigest` estável. Fail-closed: permissões de mutação nunca começam habilitadas;
`persistence.migrationRequired` sempre false; `referenceOnly` sempre true.

## Normalize
`normalizeStudioBlueprint(draft)` canonicaliza: campos ordenados por nome, telas por
kind, permissões por action; strings com trim; nomes de campo duplicados colapsados
(primeiro vence) e reportados em `collapsedDuplicates`. Determinístico:
`normalizedDigest` idêntico para entradas idênticas. Idempotente.

## Validate (estrutural)
`validateStudioBlueprint(normalized)` verifica:
- moduleId identificador válido; moduleName presente; modelType ∈ {cadastro,operacional};
  modelFamily ∈ {ModeloBase1,ModeloBase2}.
- ao menos um campo; nomes de campo únicos e identificadores válidos; type ∈ 14 tipos.
- screen kind ∈ {table,form,detail}; permission action ∈ actions canônicas.
- permissão de mutação não pode iniciar `enabled`.
- persistence `referenceOnly` e `migrationRequired: false`.

Warnings (não bloqueiam): searchable em campo não-texto; ausência de permissão de leitura.
