# QUALITY & SCALABILITY NOTES — FOUNDATION C.15

## Slice

Foundation C.15 — M21/M22 Cache + Event Bus

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do Cache Engine e Event Bus.

## Cache Engine — Escalabilidade

- **Custo de get/set/delete:** O(1) — cada operação é um lookup/gravação direta em um `Map` interno, chaveado por `"${namespace}::${key}"`; sem varredura.
- **Custo de snapshot:** O(número total de entradas não expiradas) — `snapshot()` percorre todo o `Map` uma vez, agrupando por namespace e clonando profundamente cada valor.
- **Impacto de TTL:** verificado de forma preguiçosa (lazy) — um item expirado só é detectado e removido no momento em que é lido (`get`) ou contado (`size`/`snapshot`); não há timer/varredura em background, evitando qualquer custo de CPU quando o cache está ocioso.
- **Limites de entradas/chave/profundidade:** `MAX_CACHE_ENTRIES = 1000` (total, todas as namespaces somadas), `MAX_KEY_LENGTH = 200`, `MAX_NAMESPACE_LENGTH = 100`, `MAX_VALUE_DEPTH = 8` — todos verificados antes de qualquer gravação, nunca depois.
- **Isolamento por namespace:** `namespace(name)` retorna um objeto com os mesmos métodos, todos delegando ao mesmo `Map` interno mas sempre prefixando pelo nome do namespace — nunca há colisão entre chaves de namespaces diferentes, mesmo com o mesmo nome de chave local.
- **Ausência de persistência backend:** todo o estado vive em um único `Map` em memória do processo — nenhuma escrita em disco, `localStorage`, `sessionStorage`, ou `IndexedDB`.

## Event Bus — Escalabilidade

- **Custo de emit por quantidade de handlers:** O(handlers registrados para aquele tipo de evento) — `emit()` itera apenas sobre a lista de handlers do `eventType` específico, nunca sobre todos os tipos registrados.
- **Custo de listener registry:** `on()`/`off()`/`listenerCount()` são O(1) amortizado (inserção/removal em array pequeno por tipo de evento); `listenerCount()` sem argumento é O(tipos de evento registrados).
- **Limite de handlers por evento:** `MAX_HANDLERS_PER_EVENT = 100` — verificado em `on()`/`once()` antes de adicionar.
- **Limite de tipos de evento:** `MAX_EVENT_TYPES = 200` — verificado ao registrar o primeiro handler de um tipo novo.
- **Proteção contra reentrância/loop:** `MAX_REENTRANCY_DEPTH = 5` por tipo de evento — um handler que dispara `emit()` do mesmo tipo recursivamente é impedido de crescer sem limite; a falha na profundidade máxima é capturada como resultado daquele nível específico (nunca derruba o processo nem quebra a cadeia de chamadas externas).
- **Ausência de broker externo:** toda a distribuição acontece dentro do mesmo processo, síncrona/assíncrona conforme o handler, sem fila, sem rede.

## Segurança / Fail-safe

- **Chave/evento inválido:** chave de cache vazia/não-string/excedendo o tamanho, ou tipo de evento vazio/não-string, sempre lançam erro tipado (`CacheError`/`EventBusError`) antes de qualquer efeito.
- **Payload inválido:** payload de evento (ou valor de cache) excedendo a profundidade máxima, ou contendo uma chave de poluição de protótipo em qualquer nível, sempre lança erro tipado.
- **Prototype pollution:** `__proto__`/`constructor`/`prototype` são rejeitados tanto como nome de chave/namespace (Cache) quanto como chave aninhada em qualquer valor armazenado ou payload emitido (Cache e Event Bus) — mesma técnica de guarda já usada em M13/M17.
- **Handler que falha:** nunca interrompe os handlers seguintes — cada falha é capturada individualmente e reportada em `EmitResult.results[]`, com `success:false` e a mensagem do erro; o handler seguinte sempre roda.
- **Item expirado:** tratado como completamente ausente (`get()` retorna `null`, `has()` retorna `false`) — nunca retorna um valor obsoleto, nunca lança.
- **Ausência de storage externo:** nenhuma chamada a `localStorage`/`sessionStorage`/`IndexedDB` em `infra/cache/` — verificado por teste (com remoção de comentários JSDoc para evitar falso positivo) e pelo gate G423-21.
- **Ausência de broker externo:** nenhuma chamada a `WebSocket`/`BroadcastChannel`/`Worker`/`worker_threads` em `infra/event-bus/` — verificado por teste e pelo gate G423-22.
- **Ausência de backend:** nenhum dos dois módulos importa Prisma, `@prisma/client`, ou qualquer caminho de `backend/`.

## Determinismo

- **Ordem de handlers:** `emit()` sempre executa na ordem exata de registro (`on()`/`once()`) — testado explicitamente com três handlers sequenciais.
- **TTL com clock controlado:** `CacheEngine` aceita um `clock` injetável (`() => number`); os testes de TTL usam um clock fake avançável manualmente, tornando a expiração inteiramente determinística (nenhum `setTimeout`/tempo real envolvido).
- **Mesma sequência de operações produz mesmo resultado:** ambos os módulos são livres de aleatoriedade — IDs de handler no Event Bus são um contador incremental (`_nextId`), nunca `Math.random()`/UUID.
- **Snapshot/cópias seguras:** `CacheEngine.snapshot()`/`get()` sempre retornam clones profundos — mutar o valor retornado nunca afeta o estado interno (testado explicitamente nos dois sentidos: mutar o snapshot inteiro e mutar um valor individual retornado por `get()`).
- **Sem side effects externos próprios:** nenhum dos dois módulos escreve em disco, rede, ou qualquer estado fora de si mesmo — apenas os `Map`s internos e o que os handlers/consumidores decidirem fazer.

## Códigos de erro

### CacheError

| Código | Significado |
|---|---|
| `MAK-L3-CACHE-001` | `CacheEngine` construído com uma opção `clock` que não é uma função. |
| `MAK-L3-CACHE-002` | Chave de cache inválida — vazia, tipo errado, excede `MAX_KEY_LENGTH`, ou é um nome proibido (`__proto__`/`constructor`/`prototype`). |
| `MAK-L3-CACHE-003` | Namespace inválido — vazio, tipo errado, excede `MAX_NAMESPACE_LENGTH`, ou é um nome proibido. |
| `MAK-L3-CACHE-004` | Valor armazenado excede `MAX_VALUE_DEPTH`, ou contém uma chave de poluição de protótipo em qualquer nível. |
| `MAK-L3-CACHE-005` | Cache excede `MAX_CACHE_ENTRIES`. |

### EventBusError

| Código | Significado |
|---|---|
| `MAK-L3-EVENTBUS-001` | (reservado para erros de construção futuros — nenhuma opção de construtor exigida hoje). |
| `MAK-L3-EVENTBUS-002` | Tipo de evento inválido — vazio ou não-string, em `on()`/`once()`/`off()`/`emit()`/`publish()`. |
| `MAK-L3-EVENTBUS-003` | Handler inválido — não é uma função, em `on()`/`once()`. |
| `MAK-L3-EVENTBUS-004` | Payload de evento excede `MAX_PAYLOAD_DEPTH`, ou contém uma chave de poluição de protótipo em qualquer nível. |
| `MAK-L3-EVENTBUS-005` | Limite excedido — handlers por evento (`MAX_HANDLERS_PER_EVENT`) ou tipos de evento distintos (`MAX_EVENT_TYPES`). |
| `MAK-L3-EVENTBUS-006` | Profundidade de reentrância excedida (`MAX_REENTRANCY_DEPTH`) para o mesmo tipo de evento. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex nos gates G423-21/G423-22.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `infra/cache/` ou `infra/event-bus/`.
- Runtime não chama backend — nenhum `fetch`/HTTP/IPC em nenhum dos dois módulos.
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código dos novos módulos.
- Transaction Engine não foi iniciado — nenhum diretório `core/transaction/`, nenhuma classe `TransactionEngine`/`TransactionManager` referenciada em nenhum dos dois módulos.

## Débitos técnicos controlados

- **Cache distribuído fora do C.15:** `CacheEngine` é estritamente local ao processo/instância — nenhuma sincronização entre processos, abas, ou instâncias de runtime.
- **Persistência fora do C.15:** nenhum dos dois módulos sobrevive a um restart do processo — puramente em memória, por design.
- **Broker/event bus externo fora do C.15:** `EventBus` é o stub in-process documentado em D-RI-08; o transporte real (DB-backed, multi-processo) é Foundation F (G426), que substituirá apenas o transporte por trás da mesma interface `IEventBus`.
- **Retry/circuit breaker fora do C.15:** nenhuma política de retry é aplicada a handlers que falham — a falha é reportada uma única vez, de forma determinística, no resultado de `emit()`.
- **Transações ficam para C.16:** nenhuma coordenação transacional entre múltiplas operações de cache/evento; M23 Transaction Manager ainda não existe.
- **Religamento do bootstrap ao cache (pin/CRB) fica documentado como deferido:** `08-DONE-CRITERIA.md` M21 pede cache de `EnvironmentPin`/CRB hidratado com invalidação em publish — não implementado neste slice por instrução explícita de escopo (não forçar engines existentes a depender de Cache/Event Bus sem necessidade contratual).

## Conclusão

O C.15 está apto para merge do ponto de vista de qualidade: infraestrutura runtime-local determinística e isolada para cache (TTL com clock injetável, namespaces isolados, cópias seguras, limites explícitos) e para pub/sub em processo (ordem determinística, falha de handler isolada, guarda de reentrância, limites explícitos), conformidade SSOT-literal (`ICache`/`IEventBus`) preservada com API ergonômica adicional, guarda de poluição de protótipo em ambos os módulos, sem persistência real, sem broker/storage externo, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, sem antecipar Transaction Engine ou Observability Engine, com regressão completa (G423-01–20) verde e nenhuma correção de manutenção necessária nos gates anteriores.
