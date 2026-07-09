# QUALITY & SCALABILITY NOTES — FOUNDATION C.17

## Slice

Foundation C.17 — M24 Observability Engine / Runtime Completion (slice final de Foundation C)

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do Observability Engine e do Runtime Completion.

## Escalabilidade — Observability Engine

- **Custo de `recordEvent`/`recordMetric`/`captureError`:** O(1) amortizado para o `push` no buffer, mais O(profundidade × tamanho do payload) para `validateShape`/`redactSensitive` — limitado por `MAX_PAYLOAD_DEPTH = 8`, então o custo por chamada é sempre limitado por uma constante prática.
- **Custo de `startTrace`/`endTrace`:** O(1) — `Map` interno indexado por `traceId`.
- **Custo de `snapshot()`:** O(itens bufferizados no total: eventos + métricas + traces + erros) — percorre cada buffer uma vez, clonando profundamente cada registro via `cloneRecord()` (`JSON.parse(JSON.stringify())`).
- **Limites de buffer:** `MAX_EVENTS = 500`, `MAX_METRICS = 1000`, `MAX_TRACES = 200` (traces ativos simultâneos), `MAX_TAGS = 20`, `MAX_NAME_LENGTH = 200`, `MAX_ERROR_MESSAGE_LENGTH = 2000` (truncado com reticências) — todos verificados antes de qualquer registro ser armazenado, nunca depois.
- **Ausência de I/O externo:** todo o estado (eventos/métricas/traces/erros) vive em arrays/`Map` em memória do processo — nenhuma conexão, nenhuma query, nenhum envio de rede.

## Escalabilidade — Runtime Completion

- **Custo de `checkRuntimeCompleteness()`:** O(24) fixo — o tamanho do `MODULE_REGISTRY` nunca cresce em tempo de execução; cada entrada é avaliada uma única vez, com custo O(1) (lookup direto de propriedade) ou O(1) amortizado (`serviceLocator.has()`).
- **Custo de `checkServiceAvailability()`:** O(nomes de serviço canônicos) — atualmente 20, cada um resolvido via `serviceLocator.has()`.
- **Custo de `checkGatesManifest()`:** O(tamanho do manifest fornecido) — uma chamada síncrona `fs.existsSync()` por entrada; nenhuma leitura do conteúdo do arquivo.
- **Determinístico e sem cache necessário:** cada chamada é barata o suficiente (operações O(24) ou menores) para não precisar de nenhum cache/memoização.

## Segurança / Fail-safe — Observability Engine

- **Payload/contexto/tags inválidos:** shape inválida, profundidade excedida, ou chave de poluição de protótipo (`__proto__`/`constructor`/`prototype`) em qualquer nível sempre lançam `ObservabilityError` (`MAK-L3-OBSERVABILITY-001`/`002`) — nunca aceitos silenciosamente.
- **Limite de buffer excedido:** `MAK-L3-OBSERVABILITY-004` sempre lançado ao tentar exceder `MAX_EVENTS`/`MAX_METRICS`/`MAX_TRACES` — o registro que excederia o limite nunca é armazenado.
- **Trace desconhecido/já finalizado:** `endTrace()` sobre um `traceId` inexistente ou já finalizado sempre lança `MAK-L3-OBSERVABILITY-003`.
- **Clock inválido:** construir o engine com uma opção `clock` que não é função sempre lança `MAK-L3-OBSERVABILITY-005`, antes de qualquer uso.
- **Mascaramento de dados sensíveis:** qualquer chave correspondente a `/password|token|secret|api[-_]?key|authorization|cookie|credential/i`, em qualquer profundidade de `payload`/`context`/`result`, é substituída por `'[REDACTED]'` antes de ser armazenada — testado explicitamente para eventos (`password`/`token`) e erros capturados (`apiKey`).
- **`captureError()` nunca vaza stack bruto:** o registro armazenado/retornado contém apenas `{id, name, message, context, timestamp}` — a propriedade `stack` do erro original nunca é incluída, testado explicitamente (`'stack' in captured === false`).
- **Cópias seguras (`cloneRecord`):** todo método que retorna um registro (`recordEvent`, `recordMetric`, `startTrace`, `endTrace`, `captureError`) e `snapshot()` retornam clones profundos via `JSON.parse(JSON.stringify())` — mutar o valor retornado nunca afeta o estado interno do engine (bug de shallow-copy identificado e corrigido proativamente durante este slice, antes de qualquer falha de teste, e coberto por um teste dedicado).
- **Ausência de backend/telemetria externa:** nenhuma chamada a Prisma, `@prisma/client`, caminho de `backend/`, `fetch`, Sentry/Datadog/segment.io/New Relic, ou `XMLHttpRequest`.
- **Ausência de persistência/transporte externo:** nenhuma chamada a `localStorage`/`sessionStorage`/`IndexedDB`, nenhum `WebSocket`/`BroadcastChannel`/`Worker`/`worker_threads` — verificado por teste (com remoção de comentários JSDoc para evitar falso positivo) e pelo gate G423-24.

## Segurança / Fail-safe — Runtime Completion

- **Módulo ausente nunca quebra:** `evaluateModule()` envolve toda avaliação (lookup direto, resolução via Service Locator, ou avaliador `custom`) em `try/catch` interno — qualquer exceção interna (ex.: `serviceLocator.has` mal implementado) resulta em `status: 'missing'`, nunca propaga um erro genérico para o chamador.
- **`checkServiceAvailability()`/`checkGatesManifest()` só lançam para o argumento estrutural em si:** um `serviceLocator` inválido (não é objeto, ou não implementa `has()`) lança `MAK-L3-COMPLETION-002`; um `manifest` que não é array também lança `MAK-L3-COMPLETION-002` — mas um serviço específico ausente, ou um script de gate específico ausente no disco, é sempre reportado como `available: false`/`exists: false`, nunca lançado.
- **Nunca executa comportamento real:** `checkRuntimeCompleteness()` apenas verifica presença de propriedades/serviços — testado explicitamente com um `actionEngine` falso cujo `dispatch()` marca uma flag; a flag permanece `false` após a checagem, provando que nenhuma ação real é invocada.
- **Ausência de backend:** nenhuma chamada a Prisma, `@prisma/client`, ou qualquer caminho de `backend/`.
- **Ausência de execução de UI:** nenhuma importação de `react`/`react-dom` no módulo.

## Determinismo

- **Clock injetável (Observability):** testado explicitamente — dois eventos registrados com o mesmo clock avançado produzem timestamps previsíveis (`5000`, depois `5010` após avançar 10ms).
- **Relatório determinístico (Completion):** `createFoundationCReport()` com um clock fixo (`() => 1000`) produz relatórios `deepEqual` para a mesma entrada de runtime, testado explicitamente chamando duas vezes e comparando.
- **Sem geração aleatória:** IDs de evento/métrica/trace/erro são gerados por um contador incremental (`event-1`, `trace-1`, ...) — nunca `Math.random()`/UUID.
- **Sem side effects externos próprios:** nem `ObservabilityEngine` nem `RuntimeCompletion` escrevem em disco, rede, ou qualquer estado fora de si mesmos — `RuntimeCompletion.checkGatesManifest()` apenas lê metadados de existência de arquivo (`fs.existsSync`), nunca escreve.

## Códigos de erro

### ObservabilityError (estrutural — sempre lançado)

| Código | Significado |
|---|---|
| `MAK-L3-OBSERVABILITY-001` | Nome inválido (vazio/excede `MAX_NAME_LENGTH`), payload/contexto com profundidade excedida, ou chave de poluição de protótipo em qualquer nível, ou nível de log inválido. |
| `MAK-L3-OBSERVABILITY-002` | Valor de métrica não-numérico/não-finito, ou `tags` com shape inválida/limite excedido/chave proibida/valor não-string. |
| `MAK-L3-OBSERVABILITY-003` | `endTrace()` sobre `traceId` desconhecido ou já finalizado. |
| `MAK-L3-OBSERVABILITY-004` | Limite de buffer excedido (`MAX_EVENTS`/`MAX_METRICS`/`MAX_TRACES`). |
| `MAK-L3-OBSERVABILITY-005` | `ObservabilityEngine` construído com uma opção `clock` que não é uma função. |

### RuntimeCompletionError (estrutural — sempre lançado)

| Código | Significado |
|---|---|
| `MAK-L3-COMPLETION-001` | `RuntimeCompletion` construído com uma opção `clock` que não é uma função. |
| `MAK-L3-COMPLETION-002` | `checkServiceAvailability()` chamado com um `serviceLocator` inválido, ou `checkGatesManifest()` chamado com um `manifest` que não é array. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-24 e no master gate G423 (varredura de todo `src/runtime/`).
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `infra/observability/` ou `core/completion/`.
- Runtime não chama backend — nenhum `fetch`/HTTP/IPC em nenhum dos dois módulos.
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código dos novos módulos.
- SSOT não foi alterado — nenhuma alteração em `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, `docs/runtime-implementation/`.

## Débitos técnicos controlados

- **Exportação de telemetria externa fora do C.17:** nenhum adaptador OpenTelemetry/Sentry/Datadog foi criado — `ObservabilityEngine` buffiriza localmente; uma futura integração poderia ler `snapshot()` e encaminhar para um backend real de telemetria, mas essa integração não existe neste slice.
- **Persistência entre reinícios fora do C.17:** nenhum evento/métrica/trace sobrevive a um restart do processo runtime.
- **Amostragem/agregação em alta escala fora do C.17:** nenhuma política de amostragem (sampling) ou agregação de métricas de alta cardinalidade é aplicada — os limites (`MAX_EVENTS`/`MAX_METRICS`/`MAX_TRACES`) protegem contra crescimento ilimitado, mas não implementam rollup/agregação estatística.
- **Runtime v2 / modo sombra fora do C.17:** a integração de um runtime v2 rodando em modo sombra ao lado do legado é uma recomendação documentada para um próximo ciclo, não um trabalho iniciado neste slice.

## Conclusão

O C.17 está apto para merge do ponto de vista de qualidade: Observability Engine runtime-local e determinístico com mascaramento de dados sensíveis, proteção contra poluição de protótipo, limites explícitos em todas as dimensões pedidas, e cópias profundas seguras em todo ponto de retorno; Runtime Completion como auditoria estática que nunca lança erro genérico para módulo/serviço/gate ausente, nunca executa comportamento real, e produz relatórios determinísticos; master gate `gate:g423` validando toda a superfície de Foundation C (presença e PASS de G423-01–24, ausência de Prisma/backend em todo `src/runtime/`, SSOT intocado, UI de produção intocada) em um único comando; regressão completa (G423-01–23) verde com 1 correção de manutenção documentada (checagem obsoleta em G423-23, escopo estreitado, nunca removida); zero mudança de SSOT; zero toque em UI de produção ou Studio.
