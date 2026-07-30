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

## Única exceção sancionada

`STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN` — exatamente dois caminhos, válida apenas quando a própria fatia `dev-preview-app-integration` passa `explicitlyAuthorizedForbiddenPatterns`. Sem essa opção, os mesmos dois caminhos continuam proibidos para a MESMA fatia — provado.

## Desconhecido falha fechado

Um caminho que nenhuma fatia possui e que a fatia ativa não compartilha entra em `unknown` e bloqueia. Um caminho possuído por outra fatia catalogada, sem autorização cruzada da ativa, entra em `chronologicalViolation` e bloqueia. Não existe caminho "neutro" tolerado por omissão.

## Pureza do guard

O guard importa APENAS o registry. O teste inspeciona o código-fonte e prova a ausência de `execSync`, `child_process`, `fetch(`, `process.env`, `Date.now` e `require(`. O registry não tem nenhuma importação e nenhum I/O.
