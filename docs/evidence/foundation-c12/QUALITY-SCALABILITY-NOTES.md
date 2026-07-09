# QUALITY & SCALABILITY NOTES — FOUNDATION C.12

## Slice

Foundation C.12 — M17 State Engine

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do M17 State Engine.

## Escalabilidade

- **Custo de leitura por path/chave:** O(profundidade do path) — `get()` percorre um segmento por nível de `path`, sem varredura do restante da árvore.
- **Custo de escrita/patch:** `set()` é O(profundidade do path) (cria objetos intermediários apenas ao longo do caminho); `patch()` é O(tamanho do objeto de patch), recursivo apenas sobre as chaves fornecidas — nunca varre chaves irmãs não relacionadas.
- **Custo de snapshot:** O(tamanho total do estado) — `snapshot()` faz um clone profundo via `JSON.parse(JSON.stringify(...))`, custo linear no tamanho serializado do estado.
- **Impacto de estados grandes:** como `snapshot()`/`get()`/`set()` clonam profundamente o valor lido/escrito (nunca expõem referência interna), o custo cresce com o tamanho do subárvore tocada — aceitável para estado de tela/execução local, não desenhado para blobs grandes.
- **Limites contra path profundo ou estado exagerado:** `MAX_PATH_DEPTH = 16` segmentos (path com mais níveis lança `MAK-L3-STATE-004` antes de qualquer mutação); `MAX_STATE_KEYS = 256` chaves totais (contadas recursivamente após cada `set()`/`patch()` — se excedido, lança `MAK-L3-STATE-004`).
- **Isolamento entre instâncias/contextos:** cada `new StateEngine()` possui sua própria árvore de estado privada (`_state`) — nenhuma referência compartilhada entre instâncias, testado explicitamente. Dentro de uma mesma instância, `scope(name)` oferece isolamento de namespace por convenção de path (cada scope opera sobre seu próprio segmento de nível superior), também testado explicitamente.
- **O que fica para Cache/Event Bus/Transaction futuros:** cache de leitura (evitar reclonar em leituras repetidas do mesmo path), propagação de eventos de mudança para fora do processo (M22 Event Bus), e qualquer garantia transacional multi-passo (M23 Transaction Manager) — nenhum desses existe neste slice; `subscribe()` cobre apenas notificação síncrona in-process.

## Segurança / Fail-safe

- **Estado inicial inválido:** `initialState` que não seja um objeto plano (string, array, `null`, etc.) lança `MAK-L3-STATE-001` no construtor — nunca aceita silenciosamente um estado malformado.
- **Path inválido:** path vazio, não-string, ou contendo segmento proibido (`__proto__`, `constructor`, `prototype` — mesma técnica de guarda contra poluição de protótipo já usada no M13 Expression Engine) lança `MAK-L3-STATE-002`.
- **Operação inválida:** `patch()` com argumento não-objeto, `subscribe()` com listener não-função, ou `transition()` sem um `operation.type` string lançam `MAK-L3-STATE-003`.
- **Snapshot imutável/cópia segura:** `snapshot()` retorna um clone profundo — testado explicitamente que mutar o array/objeto retornado (`push`, atribuir nova chave) não altera o estado interno do engine.
- **Ausência de persistência backend:** `StateEngine` não escreve em disco, não chama API, não consulta Prisma/MMM — opera inteiramente sobre a árvore de estado em memória do próprio processo.
- **Ausência de side effects externos:** nenhuma chamada de rede, timer, ou I/O; `subscribe()` só invoca listeners fornecidos pelo próprio chamador, de forma síncrona, dentro do mesmo processo.

## Determinismo

- **Mesma sequência de operações produz mesmo estado:** `set`/`patch`/`reset` são funções puras sobre o estado interno — a mesma sequência de chamadas sempre produz o mesmo resultado observável via `get()`/`snapshot()`.
- **`get()` não muta estado:** testado explicitamente — chamar `get()` antes/depois de uma leitura não altera o `snapshot()` do estado.
- **`snapshot()` não expõe referência interna:** testado explicitamente (mutação do snapshot retornado não vaza para o estado interno).
- **`reset()` é previsível:** sem argumento, retorna exatamente à cópia profunda de `initialState` capturada no construtor; com um `path`, retorna apenas aquele subcaminho ao valor correspondente em `initialState` (ou `{}` se não havia valor inicial ali) — testado explicitamente nos dois modos.

## Códigos de erro

| Código | Significado |
|---|---|
| `MAK-L3-STATE-001` | `StateEngine` construído com `initialState` que não é um objeto plano. |
| `MAK-L3-STATE-002` | Path/chave inválido — vazio, tipo errado, ou contendo segmento proibido (`__proto__`/`constructor`/`prototype`). |
| `MAK-L3-STATE-003` | Argumento de operação inválido — `patch()` sem objeto, `subscribe()` sem função, `transition()` sem `operation.type`. |
| `MAK-L3-STATE-004` | Limite excedido — profundidade de path acima de `MAX_PATH_DEPTH` (16) ou número total de chaves acima de `MAX_STATE_KEYS` (256). |
| `MAK-L3-STATE-005` | Operação de transição desconhecida (`operation.type` fora de `set`/`patch`/`reset`). |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-17.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `core/state/`.
- Runtime consome registry/context quando aplicável — `StateEngine` não exige registry/context (nenhuma dependência obrigatória de outra engine); `context` pode ser passado como metadado opcional, sem uso funcional neste slice.
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código do novo módulo.
- Transaction Engine não foi iniciado — nenhum diretório `core/transaction/`, nenhuma classe `TransactionEngine`/`TransactionManager`.
- Cache/Event Bus não foram iniciados — nenhum diretório `core/cache/` ou `core/event-bus/`, nenhuma classe `CacheEngine`/`EventBus`.
- Plugin/Connector não foram iniciados — nenhum diretório `core/plugin/` ou `core/connector/`, nenhuma classe `PluginEngine`/`ConnectorEngine`.

## Débitos técnicos controlados

- **Persistência real fica fora do C.12:** o estado vive inteiramente em memória do processo runtime; qualquer durabilidade entre sessões/reloads é trabalho futuro (fora do escopo deste slice).
- **Transações ficam fora do C.12:** não há wrap transacional em torno de `set`/`patch`/`transition` — cada chamada é atômica em si mesma, mas não há coordenação multi-passo com rollback.
- **Sincronização multi-aba/multi-runtime fica fora do C.12:** cada instância de `StateEngine` é isolada ao processo/sessão que a criou; sincronização entre abas/processos exigiria um transporte (M22 Event Bus ou equivalente), que não existe ainda.
- **Cache/event bus ficam fora do C.12:** nenhuma camada de cache de leitura, nenhuma propagação de eventos além de `subscribe()` in-process.
- **`transition()` não é o catálogo completo USM (20 operações):** implementado como um dispatcher mínimo e genérico (`set`/`patch`/`reset`) por decisão deliberada — o catálogo completo (`create`/`publish`/`activate`/...) pertence à autoria MMM/Studio (`platform-behavior/16-UNIVERSAL-STATE-MACHINE.md`) e sua reimplementação aqui duplicaria lógica e arriscaria o State Engine assumir responsabilidade de lifecycle/persistência — explicitamente proibido pelas regras deste slice. Documentado explicitamente, não implementado silenciosamente como incompleto.

## Conclusão

O C.12 está apto para merge do ponto de vista de qualidade: store de estado local determinístico e isolado por instância/namespace, leitura/escrita/patch/reset/snapshot seguros (sem vazamento de referência), limites explícitos contra path profundo e estado exagerado, guarda contra poluição de protótipo, `subscribe()` funcional para notificação de mudança, `transition()` mínimo e propositalmente escopado (não o catálogo completo USM, decisão documentada), sem persistência real, sem transação global, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, sem antecipar Transaction Engine, Cache, Event Bus, Plugin Engine ou Connector Engine, com regressão completa (G423-01–16 + G423-20) verde.
