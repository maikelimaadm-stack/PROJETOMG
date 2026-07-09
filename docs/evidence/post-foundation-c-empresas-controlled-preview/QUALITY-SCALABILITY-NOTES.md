# QUALITY & SCALABILITY NOTES — EMPRESAS CONTROLLED PREVIEW

## Objetivo

Explicar o preview controlado de Empresas — uma camada que transforma a projeção table/form runtime v2 num preview model isolado de objeto plano, para validação e diagnóstico, sem montar DOM real de produção e sem tocar na tela real.

## Escalabilidade

- **Custo de criação do preview model (`createPreviewModel`):** O(colunas + campos) — mapeia colunas e campos uma vez, constrói `headerLabels`/`cellMetadata` em O(colunas), e faz uma cópia profunda final via `JSON.parse(JSON.stringify())`. Sem I/O, sem render.
- **Custo de diagnostics:** O(colunas + campos) — varre campos negados, labels ausentes, metadados inválidos, e workflows não previsíveis; mais O(diferenças) para anexar as diferenças da comparação legado↔v2.
- **Custo de `run()`:** dominado pela construção da projeção via `EmpresasTableFormShadow` (duas projeções pequenas + comparação), mais a transformação O(colunas + campos). Quando desligado, é O(1) — validação de input + retorno `{ skipped: true }`.
- **Impacto com a flag DESLIGADA:** zero — `run()` retorna imediatamente sem construir projeção nem preview model, sem gravar diagnóstico, sem tocar o runtime legado ou a UI. Seguro para embarcar desligado.
- **Impacto com a flag LIGADA:** o custo de uma projeção + uma transformação de preview model, fora do caminho de render da tela. Sem DOM real nem side effect, o impacto visual é nulo.
- **Limites conhecidos:** `MAX_DIAGNOSTICS = 500` (buffer), mais os limites herdados de `tableFormProjection`/`RuntimeShadowMode` (profundidade de input, chaves de comparação).

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_EMPRESAS_CONTROLLED_PREVIEW` só liga quando exatamente `'true'`; `options.enabled` explícito tem precedência. `clear()` como off switch adicional.
- **Falha isolada:** uma falha da projeção subjacente (ou qualquer erro interno durante `run()`) é capturada em `{ ok: false, error }` e (com Observability injetado) registrada via `captureError()` — nunca lançada para o chamador, portanto nunca pode quebrar a tela Empresas. Verificado por teste e gate.
- **Sem side effect:** nunca renderiza, nunca executa salvar/editar/excluir, nunca invoca action/workflow/connector — estes aparecem apenas como metadados.
- **Sem DOM real:** nenhum acesso a `document`/`window`/`createElement`/`appendChild`. Verificado por teste e gate.
- **Sem React real:** o preview model é um objeto plano sem `$$typeof`; nenhuma importação de react/react-dom; nenhum `React.createElement`. Verificado por teste e gate.
- **Sem salvar/editar/excluir:** opera apenas sobre a projeção estrutural, nunca sobre dados de empresa reais.
- **Sem rota pública:** nenhum `createBrowserRouter`/`<Route>`/`path:'/...'`. Verificado pelo gate.
- **Dados sensíveis mascarados:** chaves correspondentes a `/password|token|secret|api[-_]?key|authorization|cookie|credential/i` mascaradas no preview model e diagnósticos.
- **Poluição de protótipo bloqueada:** `__proto__`/`constructor`/`prototype` em qualquer nível do input lançam `MAK-L3-PREVIEW-001`. Testado.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`, `BroadcastChannel`, `localStorage`/`sessionStorage`/`IndexedDB`. Verificado por teste e gate.

## Determinismo

- **Mesma projeção produz preview equivalente:** `createPreviewModel` produz estruturas `deepEqual` para a mesma projeção; a ordem de colunas/campos é herdada da projeção (já ordenada por id); o clock é injetável.
- **Diagnostics são cópias seguras:** `getDiagnostics()` retorna clones profundos, e o próprio preview model é uma cópia profunda — mutar qualquer retorno nunca afeta o estado interno. Testado.
- **Runtime legado não é alterado:** o preview apenas transforma a projeção estrutural — nunca escreve, hidrata, ou invalida o cache do bridge.
- **UI real não é alterada:** nenhum preview é montado em produção; nenhuma rota é criada.

## Débitos técnicos controlados

- **Ainda não substitui a tela Empresas:** a UI atual continua servida exclusivamente pelo runtime legado.
- **Ainda não monta preview visual real:** o preview model é um objeto plano, não um componente montado.
- **Ainda não cria rota dev-only:** nenhuma rota (pública ou dev) é criada neste slice.
- **Ainda não executa ações reais:** nenhum salvar/editar/excluir nem action/workflow/connector.
- **Integração visual dev-only fica para próximo slice:** transformar o preview model num componente visual dev-only (fora de produção, feature-flagged) é o próximo passo.

## Conclusão

O preview controlado de Empresas está apto para merge do ponto de vista de qualidade: transforma a projeção table/form runtime v2 num preview model isolado de objeto plano, opt-in e desligável, sem impacto quando desligado, sem DOM/React real/side effect/rota pública/salvar-editar-excluir/action-workflow-connector quando ligado, com falha da projeção sempre isolada como dado, dados sensíveis mascarados, poluição de protótipo bloqueada, limites explícitos, cópias profundas seguras, determinismo, e runtime legado / UI de produção / `src/App.jsx` / Foundation C completamente preservados, sem qualquer dependência de Prisma/backend/MMM direto.
