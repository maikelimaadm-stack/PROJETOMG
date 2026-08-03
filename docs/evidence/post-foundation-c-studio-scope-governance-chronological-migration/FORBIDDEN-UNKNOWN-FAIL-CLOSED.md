# Forbidden and unknown fail closed

## Proibido sempre vence

Provado, caminho a caminho, que cada um destes é `forbidden_scope`, bloqueia qualquer chamador mesmo somado a um diff perfeitamente válido, e NUNCA é liberado por pertencer ao catálogo:

```
src/App.jsx
src/pages/Home.jsx
src/components/Table.jsx
src/modules/studio/index.js
src/ModeloBase1/x.js
src/ModeloBase2/y.js
backend/server.js
prisma/schema.prisma
backend/prisma/schema.prisma
migrations/001.sql
src/apis/client.js
src/framework/core.js
src/bos/home.js
src/styles/app.css
src/runtime/loadRuntimeBundle.js
scripts/gates/lib/productionUiGuard.mjs
```

## Única exceção sancionada — CATALOG-BOUND

A exceção vive no catálogo, no campo `explicitlyAuthorizedForbiddenPatterns` da entrada `dev-preview-app-integration`: exatamente dois caminhos (`^src/App\.jsx$` e `^scripts/gates/lib/productionUiGuard\.mjs$`). Todas as outras 41 entradas declaram `[]`.

Não existe mais opção de caller. `evaluateStudioBranchScope` lê a autorização SOMENTE de `activeSlice.explicitlyAuthorizedForbiddenPatterns`, portanto:

- um chamador não consegue injetar regex ampla (provado com `/.*/ ` em três formas);
- nenhuma outra fatia herda a autorização (provado com Builder ativo e com Migration ativa);
- quando a fatia ativa não resolve, NADA é autorizado — nem proibido;
- um caminho proibido autorizado pela fatia ativa entra em `allowed` e em `explicitForbiddenAuthorized`, nunca em `unknown`.

## Desconhecido falha fechado

Um caminho que nenhuma fatia possui e que a fatia ativa não compartilha entra em `unknown` e bloqueia. Um caminho possuído por outra fatia catalogada, sem autorização cruzada da ativa, entra em `chronologicalViolation` e bloqueia. Não existe caminho "neutro" tolerado por omissão.

## Pureza do guard

O guard importa APENAS o registry. O teste inspeciona o código-fonte e prova a ausência de `execSync`, `child_process`, `fetch(`, `process.env`, `Date.now` e `require(`. O registry não tem nenhuma importação e nenhum I/O.
