# QUALITY & SCALABILITY NOTES — EMPRESAS TABLE/FORM SHADOW

## Objetivo

Explicar a projeção shadow table/form de Empresas — uma camada passiva que produz uma representação intermediária runtime v2 da tabela e do formulário e a compara com o snapshot legado, sem renderizar ou controlar a UI real.

## Escalabilidade

- **Custo de projeção de tabela (`projectTable`):** O(colunas) — mapeia e ordena as colunas por id; sem I/O, sem render. O descritor padrão tem 5 colunas.
- **Custo de projeção de formulário (`projectForm`):** O(campos) para mapear/ordenar, mais O(campos com permissão) chamadas `permissionEngine.can` quando M09 é injetado. Sem engine, é puramente O(campos). O descritor padrão tem 7 campos, 1 com permissão.
- **Custo de comparação (`compareTableForm`):** delega à `compareWithLegacy` do RuntimeShadowMode — O(chaves de topo × custo de `JSON.stringify`), limitado pelos tetos do RuntimeShadowMode (`MAX_COMPARE_KEYS`, `MAX_SNAPSHOT_DEPTH`).
- **Custo de render tree (`buildRenderTree`):** O(colunas visíveis + campos visíveis) — constrói um objeto plano pequeno.
- **Impacto com a flag DESLIGADA:** zero — `run()` retorna imediatamente sem construir projeção, sem comparar, sem gravar diagnóstico, sem tocar o runtime legado ou a UI. Seguro para embarcar desligado.
- **Impacto com a flag LIGADA:** o custo de duas projeções estruturais pequenas + uma comparação, fora do caminho de render da tela. Sem render real nem side effect, o impacto visual é nulo.
- **Limites conhecidos:** `MAX_INPUT_DEPTH = 8` (input), `MAX_DIAGNOSTICS = 500` (buffer), mais os tetos herdados do RuntimeShadowMode na comparação.

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_SHADOW_EMPRESAS_TABLE_FORM` só liga quando exatamente `'true'`; `options.enabled` explícito tem precedência. `clear()` como off switch adicional.
- **Falha isolada:** uma falha da integração de Render/Permission/Validation (ou qualquer erro interno durante `run()`) é capturada em `{ ok: false, error }` e (com Observability injetado) registrada via `captureError()` — nunca lançada para o chamador, portanto nunca pode quebrar a tela Empresas. Verificado por teste e gate.
- **Sem side effect:** nunca renderiza UI, nunca executa salvar/editar/excluir, nunca invoca action/workflow/connector — estes aparecem apenas como metadados `{id, kind, ref}`.
- **Sem DOM/React real:** a render tree é um objeto plano serializável (`JSON.stringify` seguro); nenhuma importação de react/react-dom; nenhum acesso a `document`/`window`/`createElement`. Verificado por teste e gate.
- **Sem salvar/editar/excluir:** opera apenas sobre descritores estruturais (colunas/campos/metadados), nunca sobre dados de empresa reais.
- **Dados sensíveis mascarados:** chaves correspondentes a `/password|token|secret|api[-_]?key|authorization|cookie|credential/i` mascaradas em snapshots e diagnósticos.
- **Poluição de protótipo bloqueada:** `__proto__`/`constructor`/`prototype` em qualquer nível do input lançam `MAK-L3-SHADOW-PILOT-001`. Testado.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`, `BroadcastChannel`, `localStorage`/`sessionStorage`/`IndexedDB`. Verificado por teste e gate.
- **Desacoplamento runtime→módulo:** não importa `src/modules/empresas/*` nem `src/App.jsx` — verificado por teste e gate.

## Determinismo

- **Mesma entrada produz projeção equivalente:** `projectTable`/`projectForm` ordenam colunas e campos por id e produzem estruturas `deepEqual` para a mesma entrada; a comparação é determinística; o clock é injetável.
- **Diagnostics são cópias seguras:** `getDiagnostics()` retorna clones profundos — mutar o retorno nunca afeta o estado interno. Testado.
- **Runtime legado não é alterado:** a projeção apenas modela estruturalmente o que legado e v2 representam — nunca escreve, hidrata, ou invalida o cache do bridge.

## Débitos técnicos controlados

- **Ainda não substitui a tela Empresas:** a UI atual continua servida exclusivamente pelo runtime legado.
- **Ainda não controla table/form real:** a projeção opera sobre um descritor estrutural canônico, não sobre o render vivo.
- **Ainda não executa ações reais:** nenhum salvar/editar/excluir nem action/workflow/connector é executado.
- **Ainda não altera UX:** nenhuma mudança visual ou de comportamento.
- **Preview visual controlado fica para próximo slice:** transformar a render tree intermediária em um preview visual (ainda passivo, feature-flagged) é o próximo passo.

## Conclusão

A projeção shadow de table/form de Empresas está apta para merge do ponto de vista de qualidade: representação intermediária passiva, opt-in e desligável, sem impacto quando desligada, sem render real/side effect/salvar-editar-excluir/action-workflow-connector quando ligada, com falha de engine sempre isolada como dado, ações/workflows apenas como metadados, dados sensíveis mascarados, poluição de protótipo bloqueada, limites explícitos, cópias profundas seguras, determinismo via ordenação estável, e runtime legado / UI de produção / Foundation C completamente preservados, sem qualquer dependência de Prisma/backend/MMM direto.
