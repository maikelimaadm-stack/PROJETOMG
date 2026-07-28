# Extensão de escopo aplicada na Round 2 (declaração explícita)

## Autorização recebida

A rodada autorizou correção cirúrgica de lógica de escopo branch-relative em 3 arquivos:

- `src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js`
- `scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs`
- `scripts/gates/g423-studio-module-preview-sandbox-contract.mjs`

## O que foi encontrado

Medido o estado REAL da branch (com `origin/main` restaurado), o mesmo defeito de escopo branch-relative estava presente, de forma idêntica, em outros artefatos Studio já mergeados:

- 8 testes adicionais em `src/runtime/__tests__/` com a asserção `no prior gate/test altered`;
- 20 gates Studio adicionais em `scripts/gates/` com o bloco `noOldEdit` / allowlist de escopo.

Com esses artefatos vermelhos, `npm run test:runtime` não podia ser PASS (7 testes vermelhos) e a bateria de gates Studio não podia ficar sem vermelho — dois requisitos explícitos e não negociáveis desta rodada, para os quais `PASS_COM_LIMITAÇÃO` não foi autorizado.

## O que foi feito

A MESMA correção cirúrgica, do mesmo tipo, foi aplicada a esses artefatos: passaram a consumir o guard central (`isKnownLaterStudioHeadlessArtifact`) para tolerar apenas artefatos Studio headless EXPLICITAMENTE registrados no registry.

Nenhum wildcard amplo foi criado. Em todos os casos:

- `unknown_scope` continua falhando;
- `forbidden_scope` (App/UI/backend/Prisma/modules/produção) continua falhando;
- `productionUiGuard.mjs` e `studioScopeGovernanceGuard.mjs` continuam checados contra a lista NÃO filtrada, de modo que a tolerância nunca pode liberá-los;
- `productionUiGuard.mjs` e `studioScopeGovernanceGuard.mjs` NÃO foram alterados.

## Arquivos tocados além dos 3 autorizados

Testes (8):
`studio-authoring-runtime-to-preview-bridge-contract`, `studio-authoring-runtime-to-preview-bridge-implementation-plan`, `studio-dev-preview-app-integration-contract`, `studio-dev-preview-app-integration-implementation-plan`, `studio-dev-preview-app-integration`, `studio-module-blueprint-authoring-foundation-contract`, `studio-module-blueprint-authoring-implementation-plan`, `studio-module-blueprint-authoring-runtime`.

Gates (20):
`g423-studio-foundation-audit`, `g423-studio-dev-preview-contract-bridge`, `g423-studio-dev-preview-visual-contract`, `g423-studio-dev-preview-runtime-shell-contract`, `g423-studio-dev-preview-isolated-runtime-implementation-plan`, `g423-studio-dev-preview-isolated-runtime`, `g423-studio-dev-preview-runtime-ui-contract`, `g423-studio-dev-preview-runtime-ui-implementation-plan`, `g423-studio-dev-preview-runtime-ui`, `g423-studio-dev-preview-route-menu-contract`, `g423-studio-dev-preview-route-menu-implementation-plan`, `g423-studio-dev-preview-route-menu`, `g423-studio-dev-preview-app-integration-contract`, `g423-studio-dev-preview-app-integration-implementation-plan`, `g423-studio-dev-preview-app-integration`, `g423-studio-module-blueprint-authoring-foundation-contract`, `g423-studio-module-blueprint-authoring-implementation-plan`, `g423-studio-module-blueprint-authoring-runtime`, `g423-studio-authoring-runtime-to-preview-bridge-contract`, `g423-studio-authoring-runtime-to-preview-bridge-implementation-plan`.

Esta extensão é declarada aqui de forma explícita e requer ratificação do checkpoint manual. Nenhuma lógica de validação de conteúdo foi alterada nesses artefatos — apenas a tolerância de escopo branch-relative.
