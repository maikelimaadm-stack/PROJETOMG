# QUALITY & SCALABILITY NOTES — RUNTIME V2 DEV PREVIEW ROUTE

## Objetivo

Explicar a rota dev-only para visualizar o Runtime v2 Dev Preview Hub no navegador, com dataset controlado opt-in, sem dados reais e sem alterar produção.

## Rota

- **path:** `/__dev/runtime-v2/previews`.
- **flag:** `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE` (respeita também as flags do hub e do dataset).
- **dev-only:** exige ambiente não-produção.
- **produção fail-closed:** bloqueada salvo override explícito `..._ALLOW_PROD`.
- **sem menu principal:** o path é uma constante/descritor; não é registrado em router/menu ativo.
- **sem dados reais:** só mock (hub/dataset).

## Escalabilidade

- **Custo de criação do route model:** dominado pela construção do hub model (quando rota+hub ligados) — duas fixtures pequenas + summary de dataset opcional. Quando desligado, é O(1) (retorna model com `hubModel: null`).
- **Custo do hub dentro da rota:** o mesmo do hub model (O(módulos × campos)).
- **Custo do dataset quando ligado:** o custo de construir os datasets controlados (registros pequenos) + summary.
- **Impacto com a flag DESLIGADA:** zero — a rota renderiza um fallback seguro; o route model não constrói o hub.
- **Impacto em dev com a flag LIGADA:** o custo de um hub model + dataset opcional, renderizado numa rota dev isolada.

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE` só liga quando exatamente `'true'`.
- **Dev-only:** requer ambiente não-produção; em produção **falha fechado** salvo o override explícito e documentado.
- **Produção falha fechada:** `productionBlocked` reflete produção sem flag; o componente renderiza fallback.
- **Sem dados reais:** só mock; `status.mocked = true`; `publicRoute: false`, `inMainMenu: false`.
- **Sem side effects:** nunca executa action/workflow/connector; nunca salva.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`. Verificado por teste e gate.
- **Sem storage externo:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Dados sensíveis mascarados:** herdado do hub/dataset (`[REDACTED]`).
- **Poluição de protótipo bloqueada:** options com `__proto__` lançam `MAK-L3-DEV-ROUTE-001`.
- **Falha do hub isolada:** capturada em `warnings`, `hubModel: null` — a rota nunca quebra.
- **`src/App.jsx` intocado:** a rota não é montada no router central; entregue como unidade exportável.

## Determinismo

- **Mesmo input gera mesmo route model:** sem timestamps/aleatoriedade; `deepEqual` para a mesma entrada.
- **Runtime legado não é alterado:** a rota apenas monta previews mock.
- **UI real não é alterada:** nenhuma rota/menu real; `src/App.jsx` intocado.
- **Menu principal não é alterado:** o path nunca entra no menu.

## Genericidade

- **Empresas no hub** (pipeline específico).
- **cadcps no hub** (pipeline genérico).
- **dataset controlado por módulo** (opt-in).
- **a rota serve como inspeção interna do futuro Studio** — a primeira porta de entrada visual dev-only para o runtime v2.

## Débitos técnicos controlados

- **Ainda não substitui tela real.**
- **Ainda não usa dados reais.**
- **Ainda não executa ações reais.**
- **Ainda não cria Studio.**
- **Montagem no router de produção fica para um passo futuro:** a rota está pronta para montar (path + descritor), mas não montada, para preservar os invariantes de `src/App.jsx`.
- **Migration planning fica para próximo slice.**

## Conclusão

A rota dev-only do Runtime v2 Dev Preview Hub está apta para merge do ponto de vista de qualidade: componente de rota exportável e auto-protegido (dev-only, flag-protected, fail-closed em produção, fallback seguro) que renderiza o hub (Empresas + cadcps + dataset summary opt-in) a partir de um route model puro e mockado, sem dados reais, sem side effect, sem menu, com dados sensíveis mascarados, determinismo, e — para preservar todos os invariantes — sem alterar `src/App.jsx`, sem dependência nova, sem CSS global novo, sem qualquer dependência de Prisma/backend/MMM direto.
