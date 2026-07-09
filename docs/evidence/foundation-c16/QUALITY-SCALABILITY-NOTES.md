# QUALITY & SCALABILITY NOTES — FOUNDATION C.16

## Slice

Foundation C.16 — M23 Transaction Engine

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do Transaction Engine.

## Escalabilidade

- **Custo de begin/commit/rollback:** `begin()` é O(participantes referenciados) para validar nomes + O(transações ativas) para contar o limite; `commit()`/`rollback()` são O(participantes da transação) — cada fase (prepare/commit/rollback) itera apenas sobre os participantes daquela transação específica, nunca sobre todos os participantes registrados globalmente.
- **Custo por participante:** O(1) por chamada (`prepare`/`commit`/`rollback`), delegado inteiramente à função host-registrada — o Transaction Engine não adiciona overhead assintótico além da própria chamada.
- **Custo de snapshot:** O(transações rastreadas) — `snapshot()`/`list()` percorrem o `Map` interno uma vez, clonando profundamente cada handle.
- **Limite de transações ativas:** `MAX_ACTIVE_TRANSACTIONS = 50` — verificado em `begin()` antes de criar qualquer registro novo; transações finalizadas (`committed`/`rolledback`) não contam para esse limite.
- **Limite de participantes:** `MAX_PARTICIPANTS = 50` — verificado em `registerParticipant()`.
- **Impacto de metadados grandes:** `MAX_METADATA_KEYS = 100` e `MAX_METADATA_DEPTH = 8` — verificados em `begin()` antes de criar a transação, evitando que um payload de metadados patológico nunca chegue a ser armazenado.
- **Ausência de transação real de banco:** todo o estado (transações + participantes registrados) vive em dois `Map`s em memória do processo — nenhuma conexão, nenhuma query, nenhum I/O de rede/disco.

## Segurança / Fail-safe

- **Transação inexistente:** `commit()`/`rollback()`/`get()` sobre um `transactionId` não rastreado sempre lançam/retornam de forma previsível (`get()` retorna `null`; `commit`/`rollback` lançam `MAK-L3-TRANSACTION-004`).
- **Transação finalizada:** `commit()` de uma transação `committed` ou `rolledback` sempre lança `MAK-L3-TRANSACTION-005`; `rollback()` de uma transação `committed` também lança `MAK-L3-TRANSACTION-005` (não é possível desfazer um commit); `rollback()` de uma transação já `rolledback` é idempotente por design (retorna sucesso com `idempotent: true`), documentado explicitamente em vez de lançar.
- **Participante inválido:** nome vazio/não-string/proibido, ou shape inválida (qualquer um de `prepare`/`commit`/`rollback`/`snapshot`/`restore` presente mas não sendo função) sempre lança `TransactionError` em `registerParticipant()` — nunca aceito silenciosamente.
- **Falha em prepare:** todo participante já preparado é revertido (ordem reversa) antes de retornar um resultado controlado (`PREPARE_FAILED`) — a transação nunca fica "meio preparada".
- **Falha em commit:** participantes já commitados são compensados via seu próprio `rollback` (melhor esforço) antes de retornar um resultado controlado (`COMMIT_FAILED`) — mesmo quando a compensação em si falhar, o resultado ainda reporta a falha original de commit, nunca mascarada.
- **Falha em rollback:** cada participante é revertido independentemente — a falha de um nunca impede os demais de rodar, e é sempre capturada em `participantResults[].error`, nunca mascarando ou suprimindo a falha original que motivou o rollback.
- **Erro dentro de `run()`:** sempre aciona `rollback()` da transação recém-criada antes de retornar — nenhuma transação criada por `run()` pode terminar em status `active`, testado explicitamente iterando `list()` após uma execução que falha.
- **Prototype pollution:** `__proto__`/`constructor`/`prototype` são rejeitados como nome de participante, como `transactionId` customizado, e como chave aninhada em qualquer nível dos metadados — mesma técnica de guarda já usada em M17/M21/M22.
- **Ausência de backend:** nenhuma chamada a Prisma, `@prisma/client`, ou qualquer caminho de `backend/`.
- **Ausência de persistência externa:** nenhuma chamada a `localStorage`/`sessionStorage`/`IndexedDB`, nenhum `WebSocket`/`BroadcastChannel`/`Worker`/`worker_threads` — verificado por teste (com remoção de comentários JSDoc para evitar falso positivo) e pelo gate G423-23.

## Determinismo

- **Ordem de participantes:** `commit()` executa `prepare` e depois `commit` de cada participante na ordem exata de registro (testado explicitamente com três participantes); `rollback()`/compensação executam na ordem reversa (padrão usual de "undo" em pilha).
- **Mesma sequência produz mesmo resultado:** IDs de transação são gerados por um contador incremental (`tx-1`, `tx-2`, ...) quando não fornecidos explicitamente — nunca `Math.random()`/UUID.
- **Snapshot/cópias seguras:** `snapshot()`/`list()`/`get()` sempre retornam clones profundos — mutar o valor retornado nunca afeta o estado interno (testado explicitamente).
- **`run()` sempre finaliza commit ou rollback:** nunca retorna com a transação em estado `active`, independentemente do resultado de `fn()`.
- **Sem side effects externos próprios:** o próprio `TransactionEngine` não escreve em disco, rede, ou qualquer estado fora de si mesmo — apenas os `Map`s internos e o que os participantes host-registrados decidirem fazer.

## Códigos de erro

### TransactionError (estrutural — sempre lançado)

| Código | Significado |
|---|---|
| `MAK-L3-TRANSACTION-001` | `TransactionEngine` construído com uma opção `clock` que não é uma função. |
| `MAK-L3-TRANSACTION-002` | Nome de participante inválido (vazio/proibido), ou limite de participantes (`MAX_PARTICIPANTS`) excedido. |
| `MAK-L3-TRANSACTION-003` | Participante com shape inválida (não é objeto, ou um método presente não é função), ou `begin()` referenciando um nome de participante nunca registrado. |
| `MAK-L3-TRANSACTION-004` | Transação inexistente (`commit`/`rollback` com `transactionId` desconhecido). |
| `MAK-L3-TRANSACTION-005` | Transação já finalizada de forma incompatível com a operação (`commit` em transação não-`active`; `rollback` em transação `committed`). |
| `MAK-L3-TRANSACTION-006` | Metadados/`transactionId` inválidos — não é objeto, excede `MAX_METADATA_KEYS`/`MAX_METADATA_DEPTH`/`MAX_TRANSACTION_ID_LENGTH`, contém chave de poluição de protótipo, ou `transactionId` customizado já em uso. |
| `MAK-L3-TRANSACTION-007` | Limite de transações ativas (`MAX_ACTIVE_TRANSACTIONS`) excedido. |

### Entradas de falha de negócio (nunca lançadas — sempre retornadas em `TransactionResult.error`)

| Código | Significado |
|---|---|
| `MAK-L3-TRANSACTION-PREPARE-FAILED` | Um participante falhou na fase de `prepare`; participantes já preparados foram revertidos. |
| `MAK-L3-TRANSACTION-COMMIT-FAILED` | Um participante falhou na fase de `commit` (após todos os `prepare` terem sucedido); participantes já commitados foram compensados via `rollback` (melhor esforço). |
| `MAK-L3-TRANSACTION-RUN-FAILED` | A função passada para `run()`/`runInTransaction()` lançou uma exceção; a transação foi revertida automaticamente. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-23.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `infra/transaction/`.
- Runtime não chama backend — nenhum `fetch`/HTTP/IPC no módulo.
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código do novo módulo.
- Observability Engine não foi iniciado — nenhum arquivo `infra/observability/observabilityEngine.js`, nenhuma referência a `ObservabilityEngine` no código-fonte.

## Débitos técnicos controlados

- **Transação real de banco fora do C.16:** nenhum wrapper Prisma/PostgreSQL foi criado — o `TransactionEngine` coordena apenas participantes locais host-registrados; uma futura implementação BE-facing de `ITransactionManager` poderia se registrar como um desses participantes, mas essa integração não existe neste slice.
- **Transação distribuída fora do C.16:** nenhuma coordenação entre processos/máquinas — tudo roda em memória do processo runtime local.
- **Persistência fora do C.16:** nenhuma transação sobrevive a um restart do processo.
- **Retry/circuit breaker fora do C.16:** nenhuma política de nova tentativa é aplicada a participantes que falham — a falha é reportada uma única vez, de forma determinística.
- **Observabilidade fica para C.17:** nenhum traceId, log estruturado, ou métrica de transação é emitido pelo próprio `TransactionEngine` — M24 Observability Engine ainda não existe.

## Conclusão

O C.16 está apto para merge do ponto de vista de qualidade: coordenador de unidade de trabalho runtime-local e determinístico, fluxo de duas fases (prepare → commit) com rollback/compensação automática em falha, modelo de falha de duas camadas claro (estrutural=lança, negócio=retorna) consistente com o padrão já estabelecido em M10/M11/M15/M16/M18/M19, participantes host-registrados sempre chamados em ordem determinística, `run()` que nunca deixa transação ativa vazando, limites explícitos e testados em todas as dimensões pedidas, guarda de poluição de protótipo, conformidade SSOT-literal (`ITransactionManager`, incluindo a permissão explícita de stub FE no-op), sem transação real de banco, sem persistência externa, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, sem antecipar Observability Engine, com regressão completa (G423-01–22) verde e nenhuma correção de manutenção necessária nos gates anteriores.
