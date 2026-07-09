# QUALITY & SCALABILITY NOTES — FOUNDATION C.14

## Slice

Foundation C.14 — M19 Connector Engine

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do M19 Connector Engine.

## Escalabilidade

- **Custo de resolução de connector por registry:** O(1) — `resolve(connectorId)` é um lookup direto (`registry.has`/`registry.resolve`) sobre o `IRegistry` já hidratado e congelado; nenhuma varredura.
- **Custo de resolução de operation/adapter:** O(1) — `getOperation(name)` e `_adapters.get(adapterKey(...))` operam sobre `Map`s locais, independentes do número total de connectors declarados.
- **Impacto de muitos connectors declarados:** cada connector é resolvido/carregado sob demanda (`resolve`/`load` por `connectorId`, nunca varrem todos os connectors) — o custo cresce linearmente apenas com o número de *chamadas*, não com o total de connectors no registry.
- **Limites contra payload/manifest/resultado exagerados:** diferente do C.13 (Plugin Engine), este slice **não** deixa nenhuma dimensão sem teto — `MAX_CONNECTORS = 128` (conectores simultaneamente carregados), `MAX_OPERATIONS_PER_CONNECTOR = 64`, `MAX_PAYLOAD_KEYS = 200` e `MAX_RESULT_KEYS = 500` (contagem recursiva de chaves), `MAX_PAYLOAD_DEPTH = 8` (aninhamento). Todos verificados antes de qualquer efeito (payload) ou depois da execução do adapter mas antes de retornar (resultado).
- **Isolamento entre connectors:** cada connector carregado ocupa uma entrada independente de um `Map` interno (`_loaded`, chaveado por `connectorId`); adapters são chaveados por `"connectorId::operation"` — um connector nunca invoca acidentalmente o adapter de outro.
- **O que fica para Cache/Event Bus/Transaction futuros:** cache de resultado de invocação, propagação de eventos de domínio pós-invocação (M22 Event Bus), coordenação transacional multi-connector (M23 Transaction Manager) — nenhum desses existe neste slice.

## Segurança / Fail-safe

- **Connector inexistente:** `resolve()` sobre um `connectorId` não declarado no registry sempre lança `ConnectorError` (`MAK-L3-CONNECTOR-002`).
- **Connector inválido:** `load()` valida a shape do manifest (`connectorId` não-vazio, `operations` array de strings quando presente e dentro do teto, `enabled`/`permission`/`version` com o tipo certo) e lança `MAK-L3-CONNECTOR-003` para qualquer desvio.
- **Connector desabilitado:** `invoke()` verifica `connector.enabled` **antes** de checar permissão ou invocar qualquer adapter — retorna `MAK-L3-CONNECTOR-005` sem jamais rodar o adapter (testado explicitamente com uma flag `executed`).
- **Operation desconhecida:** se o nome da operation nunca foi registrado pelo host (`registerOperation`), `invoke()` lança `ConnectorError` (`MAK-L3-CONNECTOR-004`) antes mesmo de resolver o connector.
- **Operation não permitida:** mesmo conhecida pelo host, se o connector específico não a declarou em `operations`, a execução é bloqueada (`MAK-L3-CONNECTOR-006`) sem invocar o adapter.
- **Permissão negada:** delegada 100% ao M09 Permission Engine (`connector.permission` declarado) — negada bloqueia (`MAK-L3-CONNECTOR-008`) antes do adapter rodar.
- **Ausência de adapter/engine obrigatória:** falta do Permission Engine quando exigido, ou falta de adapter bound para uma operation permitida, ambos retornam `MAK-L3-CONNECTOR-007` de forma previsível.
- **Bloqueio de código externo arbitrário:** o Connector Engine nunca executa nada além de uma função explicitamente registrada pelo host via `registerAdapter()`; o manifest é dado puramente declarativo.
- **Ausência de eval/new Function/import dinâmico inseguro/fetch direto:** verificado por teste automatizado (com remoção de comentários JSDoc antes da checagem, para não confundir documentação sobre "por que não usamos fetch/eval/import dinâmico" com uso real) e pelo gate G423-19, que também roda uma checagem comportamental dinâmica (operation desconhecida nunca executa silenciosamente).
- **Tratamento de segredos e dados sensíveis:** qualquer chave do resultado do adapter cujo nome combine com `password`/`token`/`secret`/`api[-_]?key`/`authorization`/`credential` é substituída por `'[REDACTED]'` antes do `ConnectorResponse` ser retornado — testado explicitamente. Nenhum payload bruto é embutido em mensagens de erro.

## Determinismo

- **Mesma entrada produz mesmo resultado quando o adapter é determinístico:** testado explicitamente — duas chamadas de `invoke()` com o mesmo `connectorId`/`operation`/`payload` produzem `ConnectorResponse` estritamente iguais.
- **Connector Engine não cria side effects externos próprios:** nenhuma escrita em disco, nenhuma chamada de rede — apenas os `Map`s internos (`_loaded`, `_adapters`, `_operations`) e o que o adapter host-registrado decidir fazer.
- **Engine só resolve/delega para adapter host-registrado:** toda a lógica de integração real vive no adapter, nunca dentro do `ConnectorEngine`.
- **Falha estrutural vs falha de negócio:** connector/manifest/operation inexistentes ou malformados, e violações de limite/prototype-pollution, sempre lançam `ConnectorError`; toda condição operacional esperada (desabilitado, não permitido, dependência ausente, permissão negada, adapter falhou) é sempre retornada em `ConnectorResponse.error`, nunca lançada.

## Códigos de erro

| Código | Significado |
|---|---|
| `MAK-L3-CONNECTOR-001` | `ConnectorEngine` construído sem um registry válido (`IRegistry`). |
| `MAK-L3-CONNECTOR-002` | Connector inexistente no registry (`resolve()` com `connectorId` desconhecido). |
| `MAK-L3-CONNECTOR-003` | Manifest ou `ConnectorRequest` com shape inválida, ou argumento inválido em `registerOperation()`/`registerAdapter()`. |
| `MAK-L3-CONNECTOR-004` | Operation desconhecida — nunca registrada pelo host como Host Adapter Registry entry. |
| `MAK-L3-CONNECTOR-005` | Connector desabilitado (`enabled: false`). |
| `MAK-L3-CONNECTOR-006` | Operation conhecida pelo host, mas não declarada nas `operations` do connector. |
| `MAK-L3-CONNECTOR-007` | Dependência obrigatória ausente — Permission Engine quando exigido, ou nenhum adapter bound para a operation. |
| `MAK-L3-CONNECTOR-008` | Invocação negada pelo Permission Engine (M09). |
| `MAK-L3-CONNECTOR-009` | Payload/manifest/resultado excede um limite de segurança (chaves, profundidade, número de connectors/operations), ou contém uma chave de poluição de protótipo (`__proto__`/`constructor`/`prototype`). |
| `MAK-L3-CONNECTOR-010` | O adapter host-registrado lançou uma exceção durante a execução. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-19.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `core/connector/`.
- Runtime consome registry hidratado — `ConnectorEngine` só usa `registry.has()`/`registry.resolve()` sobre o `IRegistry` já populado (bucket CRB `connector`, já existente desde C.3, usado sem modificação de shape).
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código do novo módulo.
- Cache/Event Bus não foram iniciados — nenhum diretório `core/cache/` ou `core/event-bus/`, nenhuma classe `CacheEngine`/`EventBus`.
- Transaction Engine não foi iniciado — nenhum diretório `core/transaction/`, nenhuma classe `TransactionEngine`/`TransactionManager`.

## Débitos técnicos controlados

- **Adapters reais externos ficam fora do core C.14:** nenhum transporte HTTP/DB/mensageria real é implementado dentro de `core/connector/` — apenas o contrato (`registerAdapter`) para que o host forneça essa implementação.
- **Autenticação/segredos reais de conectores ficam fora do C.14:** nenhuma credencial, token, ou chave de API real existe em código, fixture, ou evidência deste slice; a redação automática protege contra vazamento acidental caso um adapter futuro retorne dados sensíveis.
- **Retry/circuit breaker ficam fora do C.14:** `08-DONE-CRITERIA.md` M19 pede "HTTP connector invoke with retry stub" e "circuit breaker" — deliberadamente não implementados aqui, por instrução explícita deste slice; ficam como responsabilidade do adapter host, se e quando um adapter real for escrito.
- **Cache/event bus ficam para C.15:** nenhuma camada de cache de invocação, nenhuma propagação de eventos de domínio.
- **Transações ficam para C.16:** nenhuma coordenação transacional multi-connector.
- **Marketplace/publicação de conectores fica fora do C.14:** nenhum fluxo de descoberta, publicação, ou instalação de conectores de terceiros.

## Conclusão

O C.14 está apto para merge do ponto de vista de qualidade: camada de integração registry-driven, determinística e fail-safe, modelo de falha de duas camadas claro (estrutural=lança, negócio=retorna) consistente com o padrão já estabelecido em M10/M11/M16/M18, invocação sempre delegada a um adapter host-registrado (zero chamada externa arbitrária, zero eval/new Function/import dinâmico/fetch direto), limites explícitos e testados em todas as dimensões relevantes (diferente do C.13, por instrução explícita), guarda contra poluição de protótipo, redação automática de dados sensíveis, integração real com o Permission Engine, isolamento entre connectors garantido por chaveamento independente, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, sem antecipar Cache, Event Bus, ou Transaction Engine, com regressão completa (G423-01–18 + G423-20) verde.
