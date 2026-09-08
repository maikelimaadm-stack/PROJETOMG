# Escopo

## Alterado (14 arquivos de teste, autorização exata por arquivo)

Nove consumidores `no prior gate/test altered`:

- studio-module-blueprint-authoring-foundation-contract.test.js
- studio-module-blueprint-authoring-implementation-plan.test.js
- studio-module-blueprint-authoring-runtime.test.js
- studio-dev-preview-app-integration-contract.test.js
- studio-dev-preview-app-integration-implementation-plan.test.js
- studio-dev-preview-app-integration.test.js
- studio-authoring-runtime-to-preview-bridge-contract.test.js
- studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js
- studio-authoring-runtime-to-preview-bridge.test.js

Três cópias do helper `ownScopeApplies` e suas asserções branch-relativas:

- studio-scope-governance-historical-branch-consumers.test.js
- studio-scope-governance-chronological-migration.test.js
- studio-scope-governance-main-diff-correction.test.js

Mais dois:

- studio-builder-lifecycle-normalization.test.js
- studio-scope-governance-non-studio-branch-applicability.test.js

## Criado

- src/runtime/__tests__/studio-scope-governance-non-studio-runtime-compatibility.test.js
- scripts/gates/g423-studio-scope-governance-non-studio-runtime-compatibility.mjs
- esta pasta de evidência
- entrada 47 no registry
- dois scripts em package.json, seguindo o padrão obrigatório do repositório

## Intocado

`studioScopeGovernanceGuard.mjs`, `productionUiGuard.mjs`, `package-lock.json`,
`.github/workflows/**`, `src/App.jsx`, `src/modules/**`, `src/pages/**`,
`backend/**`, `prisma/**`, migrations, APIs, autenticação, permissões, Vercel,
Railway, branch protection e as entradas 1..46 do catálogo.
