# QUALITY & SCALABILITY NOTES — EMPRESAS DEV-ONLY PREVIEW HARNESS

## Objetivo

Explicar o harness dev-only do preview de Empresas — um ponto de visualização isolado, opt-in e fail-closed que alimenta o preview visual runtime v2 com uma fixture mock segura, para validação em desenvolvimento, sem dados reais e sem alterar produção.

## Escalabilidade

- **Custo da fixture (`createEmpresasDevPreviewFixture`):** O(colunas + campos) — constrói um objeto plano constante e aplica mascaramento O(chaves de meta); uma cópia profunda final garante isolamento. Sem I/O, sem rede, sem banco.
- **Custo de renderização do preview:** O(colunas + campos + diagnósticos) — herdado do `EmpresasDevPreview`; listas estruturais pequenas.
- **Custo de diagnostics:** O(warnings + differences + deniedFields) — já materializados na fixture.
- **Impacto com a flag DESLIGADA:** zero — `EmpresasDevPreviewHarness` renderiza `null`; nada é construído nem montado. Em produção, falha fechada por padrão.
- **Impacto em dev com a flag LIGADA:** o custo de construir a fixture constante e renderizar o preview num harness manual isolado, fora do caminho de produção.
- **Limites conhecidos:** a fixture é um mock pequeno e fixo; não há crescimento com dados reais (não usa dados reais).

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_HARNESS` só liga quando exatamente `'true'`.
- **Dev-only:** requer ambiente não-produção; em produção **falha fechado** salvo o override explícito e documentado `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_HARNESS_ALLOW_PROD === 'true'`. Verificado por teste e gate.
- **Produção falha fechada:** dupla proteção — a flag do harness e o próprio `EmpresasDevPreview` re-checam produção.
- **Fixture sem dados reais:** marcada `source: 'mock-fixture'`, `mocked: true`; apenas ids/labels/metadados estruturais; nunca registros de empresa reais, nunca banco/backend/Prisma/fetch.
- **Sem side effect:** nunca executa salvar/editar/excluir nem action/workflow/connector — actions/workflows aparecem apenas como metadados.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`. Verificado por teste e gate.
- **Sem persistência:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Dados sensíveis mascarados:** chaves sensíveis de exemplo na fixture (`apiKey`) mascaradas para `[REDACTED]`.
- **Sem rota/menu:** nenhum registro de rota pública ou item de menu; harness exportável sem montagem automática; `src/App.jsx` intocado. Verificado por teste e gate.
- **React fora do core:** o `.jsx` do harness não é exportado pelo barrel `src/runtime/index.js` — o core do runtime permanece framework-free.

## Determinismo

- **Mesma fixture gera mesmo preview:** `createEmpresasDevPreviewFixture` retorna sempre a mesma estrutura; o preview derivado é determinístico.
- **Runtime legado não é alterado:** o harness apenas monta um preview de mock — nunca toca o bridge.
- **UI real não é alterada:** nenhuma rota/menu; nenhum toque em `src/App.jsx` ou na tela real de Empresas.

## Débitos técnicos controlados

- **Ainda não substitui a tela Empresas:** a UI atual continua servida exclusivamente pelo runtime legado.
- **Ainda não usa dados reais:** o harness usa apenas a fixture mock.
- **Ainda não executa ações reais:** nenhum salvar/editar/excluir nem action/workflow/connector.
- **Ainda não cria Studio:** nada relacionado ao Studio é tocado.
- **Segundo módulo piloto fica para próximo slice:** aplicar o padrão a um segundo módulo, ou alimentar o harness com um dataset dev controlado maior, é o próximo passo.

## Conclusão

O harness dev-only do preview de Empresas está apto para merge do ponto de vista de qualidade: componente React exportável (sem rota/menu/auto-mount) que alimenta o preview visual com uma fixture mock segura e determinística, opt-in e fail-closed em produção, sem dados reais, sem side effect/salvar-editar-excluir/action-workflow-connector, com dados sensíveis mascarados, determinismo, core testável separado do `.jsx`, nenhum React no barrel do runtime, e runtime legado / UI de produção / `src/App.jsx` / menu / Foundation C completamente preservados, sem dependência nova, sem CSS global novo, e sem qualquer dependência de Prisma/backend/MMM direto.
