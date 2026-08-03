# App Integration — regressão own-slice

## Fixture obrigatória

```
src/studio/blueprint-engine/dev-preview-app-integration/index.js
docs/evidence/post-foundation-c-studio-dev-preview-app-integration/CERTIFICATION-REPORT.md
src/App.jsx
scripts/gates/lib/productionUiGuard.mjs
```

Caller: `dev-preview-app-integration`.

## Resultado medido

| campo | valor |
|---|---|
| `activeSliceId` | `dev-preview-app-integration` |
| `safe` | **true** |
| `forbidden` | `[]` |
| `unknown` | `[]` |
| `chronologicalViolation` | `[]` |
| `allowed` | **4 / 4** |
| `explicitForbiddenAuthorized` | exatamente `scripts/gates/lib/productionUiGuard.mjs`, `src/App.jsx` |

`src/App.jsx` e `productionUiGuard.mjs` aparecem em `allowed` e NÃO aparecem em `unknown` — provado individualmente para cada um.

## Chamadores anteriores e posteriores

- chamadores ANTERIORES ou iguais (`module-preview-sandbox`, `dev-preview-route-menu`, `dev-preview-app-integration-contract`): `safe=true`, `forbidden=[]`;
- chamadores POSTERIORES (`authoring-runtime-to-preview-bridge`, `bridge-decision-core-envelope-builder`): `forbidden=[]` porque a fatia ativa autoriza, mas o branch é bloqueado por `active_slice_before_caller` — a cronologia continua valendo.

## Não-herança

Com o Builder ativo, `src/App.jsx` volta a `forbidden` e `explicitForbiddenAuthorized` fica vazio. Com a Migration ativa, idem. Com `module-preview-sandbox` ativo, idem.
