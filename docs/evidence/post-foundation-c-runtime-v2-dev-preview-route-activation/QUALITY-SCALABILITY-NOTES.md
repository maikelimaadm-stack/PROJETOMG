# QUALITY & SCALABILITY NOTES — RUNTIME V2 DEV PREVIEW ROUTE ACTIVATION

## Objetivo

Explicar a ativação segura da rota dev-only do Runtime v2 Preview — a montagem real de `/__dev/runtime-v2/previews` no roteador central (`src/App.jsx`), atrás de guardas dev-only e opt-in, fora do menu, sem dados reais e sem impacto em produção — e como a exceção nos gates foi mantida precisa (não genérica).

## Rota

- **path:** `/__dev/runtime-v2/previews`.
- **montada:** dentro do `<Routes>` central de `src/App.jsx`, guardada por `shouldMountRuntimeV2DevPreviewRoute()`.
- **flag:** `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE` (respeita hub + dataset flags).
- **dev-only:** exige `import.meta.env.DEV` (ou override de produção explícito).
- **produção fail-closed:** `shouldMountRuntimeV2DevPreviewRoute` retorna `false` em produção sem override.
- **sem menu principal:** `inMainMenu: false`; nenhum registro em menu/nav.
- **sem dados reais:** herdado da rota/hub/dataset (mock only).

## Escalabilidade

- **Impacto com a flag DESLIGADA:** zero — o portão retorna `false`; o `<Route>` não é adicionado; em builds de produção o Vite elimina o ramo via `import.meta.env.DEV`.
- **Impacto em dev com a flag LIGADA:** o custo de renderizar a rota → hub → previews (fixtures pequenas), numa rota dev isolada, carregada de forma **lazy** (nenhum custo de bundle no caminho de produção quando desligada).
- **Custo de montar a rota:** o portão de montagem é O(1) (checagem de flags/ambiente).
- **Custo de carregar o hub / o dataset quando ligado:** o mesmo dos slices do hub/dataset (fixtures pequenas).

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; só monta com `import.meta.env.DEV` + a flag da rota.
- **Dev-only:** `isRuntimeV2DevEnvironment` exige ambiente de desenvolvimento (ou override explícito).
- **Produção falha fechada:** ver acima.
- **Sem dados reais:** só mock.
- **Sem side effects:** o bloco montado só referencia o componente da rota (dev-guarded); a rota/hub/dataset não têm side effects.
- **Sem salvar/editar/excluir:** nenhum.
- **Sem action/workflow/connector real:** nenhum.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate no bloco de montagem.
- **Sem storage externo:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Dados sensíveis mascarados:** herdado do hub/dataset (`[REDACTED]`).

## Gates não enfraquecidos de forma genérica

- **Exceção precisa em um único lugar:** `scripts/gates/lib/productionUiGuard.mjs` codifica a única mudança tolerada em `src/App.jsx` (apenas adições, marker dev, sem tokens proibidos, só path dev). Os 21 gates que guardam `src/App.jsx` passaram a **chamar** esse guard, em vez de repetir o `git diff` inline — mantendo a mesma superfície de invariante.
- **Nada mais foi tolerado:** qualquer outra mudança em `src/App.jsx`, e **qualquer** mudança em `src/shared`/`src/framework`/`src/modules`/`src/studio`, continua ofensora e faz o gate falhar.
- **Diff verificável:** o diff de `src/App.jsx` é apenas aditivo; nenhuma linha existente é removida ou alterada; a única `path=` adicionada é o path dev.

## Determinismo

- **Rota previsível:** `getRuntimeV2DevPreviewRouteMountPlan` é determinístico para o mesmo ambiente.
- **Runtime legado não é alterado.**
- **UI real não é alterada** além da montagem dev-only sancionada.
- **Menu principal não é alterado.**

## Débitos técnicos controlados

- **Ainda não substitui tela real.**
- **Ainda não usa dados reais.**
- **Ainda não executa ações reais.**
- **Ainda não cria Studio.**
- **Migration planning fica para próximo slice.**

## Conclusão

A ativação da rota dev-only está apta para merge do ponto de vista de qualidade: a rota é montada de fato no roteador central, guardada por um portão puro e determinístico (dev + flag, fail-closed em produção), carregada de forma lazy — sem dados reais, sem side effect, sem menu, com dados sensíveis mascarados. A exceção nos gates é precisa e centralizada num único guard compartilhado; os gates **não foram enfraquecidos de forma genérica**. Sem dependência nova, sem CSS global novo, sem qualquer dependência de Prisma/backend/MMM direto.
