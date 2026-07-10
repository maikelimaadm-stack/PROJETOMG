# QUALITY & SCALABILITY NOTES — RUNTIME V2 DEV PREVIEW ROUTE MOUNT

## Objetivo

Explicar a montagem segura da rota dev-only do Runtime v2 Preview — um portão de montagem puro e um wrapper dev-guarded que permitem abrir `/__dev/runtime-v2/previews` somente em desenvolvimento, com flag, fora do menu, sem dados reais e sem alterar produção.

## Rota

- **path:** `/__dev/runtime-v2/previews`.
- **flag:** `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE` (respeita hub + dataset flags).
- **dev-only:** exige `import.meta.env.DEV` (ou override de produção explícito).
- **produção fail-closed:** `shouldMountRuntimeV2DevPreviewRoute` retorna `false` em produção sem override.
- **sem menu principal:** `inMainMenu: false`; nenhum registro em router/menu ativo.
- **sem dados reais:** herdado da rota/hub/dataset (mock only).

## Escalabilidade

- **Impacto com a flag DESLIGADA:** zero — o portão retorna `false`; nada é montado; em builds de produção o Vite elimina o ramo via `import.meta.env.DEV`.
- **Impacto em dev com a flag LIGADA:** o custo de renderizar a rota → hub → previews (fixtures pequenas), numa rota dev isolada.
- **Custo de carregar a rota:** o portão de montagem é O(1) (checagem de flags/ambiente).
- **Custo de carregar o hub / o dataset quando ligado:** o mesmo dos slices do hub/dataset (fixtures pequenas).

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; só monta com `import.meta.env.DEV` + a flag da rota.
- **Dev-only:** `isRuntimeV2DevEnvironment` exige ambiente de desenvolvimento (ou override explícito).
- **Produção falha fechada:** ver acima.
- **Sem dados reais:** só mock.
- **Sem side effects:** o portão e o wrapper não executam nada; a rota/hub/dataset não têm side effects.
- **Sem salvar/editar/excluir:** nenhum.
- **Sem action/workflow/connector real:** nenhum.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate.
- **Sem storage externo:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Dados sensíveis mascarados:** herdado do hub/dataset (`[REDACTED]`).
- **`src/App.jsx` intocado:** o mecanismo de montagem não edita o router central; o opt-in é uma linha dev-guarded que o mantenedor aplica.

## Determinismo

- **Rota previsível:** `getRuntimeV2DevPreviewRouteMountPlan` é determinístico para o mesmo ambiente.
- **Runtime legado não é alterado.**
- **UI real não é alterada.**
- **Menu principal não é alterado.**

## Débitos técnicos controlados

- **Edição do `src/App.jsx` central fica como opt-in do mantenedor:** para preservar o invariante do programa (verificado por ~11 gates) e não fazer gambiarra, o slice não edita o router central; entrega o portão de montagem e o snippet de uma linha.
- **Ainda não substitui tela real.**
- **Ainda não usa dados reais.**
- **Ainda não executa ações reais.**
- **Ainda não cria Studio.**
- **Migration planning fica para próximo slice.**

## Conclusão

A montagem da rota dev-only está apta para merge do ponto de vista de qualidade: portão de montagem puro e determinístico (dev + flag, fail-closed em produção), wrapper que renderiza `null` fora de dev, e um mount plan estruturado — sem dados reais, sem side effect, sem menu, com dados sensíveis mascarados. Para preservar o invariante central do programa, `src/App.jsx` não foi editado; a montagem é um opt-in de uma linha documentado para o mantenedor. Sem dependência nova, sem CSS global novo, sem qualquer dependência de Prisma/backend/MMM direto.
