# STUDIO METAMODEL CONTRACT

O metamodelo descreve **entidades conceituais** do Studio. É **contract-only**:
não gera schema, migration, backend, módulo ou UI.

## Entidades (19)

`StudioProject`, `StudioModel`, `StudioModule`, `StudioField`, `StudioFieldType`,
`StudioScreen`, `StudioTable`, `StudioForm`, `StudioValidation`,
`StudioRelationship`, `StudioPermission`, `StudioRoutePlan`, `StudioMenuPlan`,
`StudioPersistenceBoundary`, `StudioRuntimeBinding`, `StudioDiagnostics`,
`StudioGatePlan`, `StudioBlueprint`, `StudioVersion`.

Cada entidade declara: `entityName`, `purpose`, `requiredFields`,
`optionalFields`, `relationships`, `status: 'contract'`, `firstSliceRequired`,
`risks`, `notes`.

## Invariantes

- `generatesSchema: false`, `generatesMigration: false`, `generatesBackend: false`,
  `generatesModule: false`, `generatesUi: false`
- `isContract: true`, `isPersistence: false`
- `metamodelDigest` determinístico

## Riscos registrados

- Não deve virar schema real.
- Não deve auto-gerar módulo/UI.
