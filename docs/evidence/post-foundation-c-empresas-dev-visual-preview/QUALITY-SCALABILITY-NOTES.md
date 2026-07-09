# QUALITY & SCALABILITY NOTES — EMPRESAS DEV-ONLY VISUAL PREVIEW

## Objetivo

Explicar a prévia visual dev-only de Empresas — uma visualização isolada, opt-in e fail-closed do preview model runtime v2, para desenvolvimento e inspeção interna, sem controlar a tela real nem alterar produção.

## Escalabilidade

- **Custo de renderização visual dev-only:** O(colunas + campos + diagnósticos) — os componentes mapeam listas estruturais pequenas; nenhuma virtualização é necessária no escopo dev.
- **Custo de tabela preview:** O(colunas) — renderiza um cabeçalho + uma linha estrutural (nunca linhas de dados reais).
- **Custo de form preview:** O(campos) — uma linha por campo com metadados.
- **Custo de diagnostics:** O(warnings + differences + actions + workflows + metadata) — listas pequenas.
- **Custo do view model (`createEmpresasDevPreviewModel`):** O(colunas + campos) para transformar o preview model, mais mascaramento O(chaves de meta).
- **Impacto com a flag DESLIGADA:** zero — `EmpresasDevPreview` renderiza `null`; nada é construído nem montado. Em produção, falha fechada por padrão.
- **Impacto com a flag LIGADA em dev:** o custo de transformar o preview model e renderizar listas estruturais pequenas, num harness dev isolado, fora do caminho de produção.
- **Limites conhecidos:** as estruturas herdam os limites do preview model / projeção (colunas, campos, diagnósticos já limitados nos slices anteriores).

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW` só liga quando exatamente `'true'`.
- **Dev-only:** requer ambiente não-produção; em produção **falha fechado** salvo o override explícito e documentado `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_ALLOW_PROD === 'true'`. Verificado por teste e gate.
- **Falha isolada:** um preview model inválido degrada para um view model de fallback seguro (`valid: false`) — nunca lança, nunca quebra o app. Poluição de protótipo/opção inválida lançam `EmpresasDevPreviewError` (falha estrutural do desenvolvedor, não runtime).
- **Sem side effect:** nunca executa salvar/editar/excluir nem action/workflow/connector — actions/workflows aparecem apenas como texto metadata (`{id} ({kind}) → {ref}`); nenhum `onClick`/`dispatch`/`start`/`execute`. Verificado por teste e gate.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`. Verificado por teste e gate.
- **Sem persistência:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`. Verificado por teste e gate.
- **Dados sensíveis mascarados:** chaves correspondentes a `/password|token|secret|api[-_]?key|authorization|cookie|credential/i` mascaradas no view model.
- **Produção falha fechada:** ver "dev-only".
- **Sem menu/rota:** nenhum registro de rota pública ou item de menu; nenhum toque em `src/App.jsx`. Verificado por teste e gate.
- **React fora do core:** os `.jsx` não são exportados pelo barrel `src/runtime/index.js` — o core do runtime permanece framework-free; nenhuma dependência circular runtime↔UI.

## Determinismo

- **Mesmo preview model produz estrutura equivalente:** `createEmpresasDevPreviewModel` produz view models `deepEqual` para a mesma entrada; a ordem de colunas/campos é herdada do preview model (já ordenado).
- **Diagnostics são cópias seguras:** o view model é uma estrutura nova a cada chamada; o mascaramento usa cópias profundas.
- **Runtime legado não é alterado:** o preview apenas transforma e exibe o preview model — nunca toca o bridge.
- **UI real não é alterada:** nenhum preview é montado em produção; nenhuma rota/menu é adicionado.

## Débitos técnicos controlados

- **Ainda não substitui a tela Empresas:** a UI atual continua servida exclusivamente pelo runtime legado.
- **Ainda não usa dados reais em produção:** o preview renderiza apenas estrutura; nenhuma linha de dados real.
- **Ainda não executa ações reais:** nenhum salvar/editar/excluir nem action/workflow/connector.
- **Ainda não cria Studio:** nada relacionado ao Studio é tocado.
- **Rota pública/produção fica fora do escopo:** nenhuma rota (pública ou dev) é registrada neste slice; a montagem num harness dev com dados mockados é o próximo passo.

## Conclusão

A prévia visual dev-only de Empresas está apta para merge do ponto de vista de qualidade: componentes React isolados que renderizam o view model runtime v2 apenas para desenvolvimento, opt-in e fail-closed em produção, sem montar em produção, sem rota/menu, sem side effect/salvar-editar-excluir/action-workflow-connector real, com fallback seguro para modelo inválido, dados sensíveis mascarados, determinismo, core testável separado dos `.jsx`, nenhum React no barrel do runtime, e runtime legado / UI de produção / `src/App.jsx` / Foundation C completamente preservados, sem dependência nova, sem CSS global novo, e sem qualquer dependência de Prisma/backend/MMM direto.
