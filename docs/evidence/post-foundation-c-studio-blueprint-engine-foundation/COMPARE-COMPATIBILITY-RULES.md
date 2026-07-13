# Compare & Compatibility Rules

`compareStudioBlueprints(current, next)` é um diff **estrutural** puro com `compareDigest`
estável:
- `addedFields` / `removedFields` — por nome de campo.
- `retypedFields` — `{ field, from, to }`.
- `nowRequiredFields` — campos que ganharam `required`.
- `addedPermissions` / `removedPermissions` — por action.
- `moduleIdChanged` / `modelFamilyChanged`.
- `identical` — true quando nada mudou.

A CLASSIFICAÇÃO de compatibilidade é decidida por
`checkStudioBlueprintEngineCompatibility` a partir desse diff:

| Mudança | Classificação |
| --- | --- |
| idênticos | compatible |
| só adições (campo/permissão) | backward_compatible |
| campo removido | breaking |
| campo retipado | breaking |
| campo tornou-se required | breaking |
| permissão removida | breaking |
| moduleId / modelFamily mudou | breaking |
| entrada não-objeto | invalid |

Regra de versionamento: `breaking → requiresMajorVersion`,
`backward_compatible → requiresMinorVersion`.
