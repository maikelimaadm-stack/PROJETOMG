# QUALITY & SCALABILITY NOTES — FOUNDATION C.11

## Slice

Foundation C.11 — M16 Execution Engine

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do M16 Execution Engine.

## Escalabilidade

- **Custo de roteamento por comando:** O(1) — o namespace (`action.`/`workflow.`) é lido por um único `indexOf('.')`, e a resolução do handler é um lookup direto no `IRegistry` já hidratado (`registry.has`/`registry.resolve`), sem varredura.
- **Custo de validação por payload:** delegado integralmente a M15 `ValidationEngine.validateRecord()` — custo já documentado em `docs/evidence/foundation-c10/QUALITY-SCALABILITY-NOTES.md` (O(regras) por campo, O(campos) por registro, com tetos explícitos). O Execution Engine não adiciona nenhum custo próprio além de um lookup de `payload.validation` na definição.
- **Custo de delegação para action/workflow:** delegado integralmente a M10 (`dispatch`) e M11 (`start`) — custo já documentado em `docs/evidence/foundation-c6` e `docs/evidence/foundation-c7`. O Execution Engine não reprocessa nem envolve a execução em nenhuma camada adicional de custo assintótico.
- **Limites contra payload exagerado:** herdados de M15 (`MAX_RULES_PER_FIELD`, `MAX_FIELDS_PER_VALIDATION`, `MAX_PATTERN_LENGTH`, `MAX_CUSTOM_EXPRESSION_LENGTH`) — o Execution Engine não impõe teto próprio sobre o tamanho do `payload`, pois delega essa responsabilidade à Validation Engine quando declarada.
- **Impacto de múltiplas execuções concorrentes no runtime local:** cada chamada de `execute()` é independente e sem estado compartilhado mutável entre chamadas (nenhuma variável de instância é escrita durante `execute()`) — seguro para chamadas concorrentes no mesmo processo. Workflows com `store` em memória (M11, herdado de C.7) permanecem a única fonte de estado mutável entre chamadas, e essa responsabilidade já pertence a M11, não a M16.
- **O que fica para State/Transaction futuros:** persistência real de instância de workflow (troca do `InMemoryWorkflowStore` por um store real via Internal API), transação atômica multi-step (rollback coordenado entre múltiplos handlers), e emissão de eventos pós-commit para M22 — todos fora do escopo deste slice, pois seus providers (M17, M22, M23) ainda não existem.

## Segurança / Fail-safe

- **Permissão antes da execução:** Stage 2 (Authorize) roda antes de Stage 3 (Execute) — uma permissão negada bloqueia a chamada ao Action/Workflow Engine; o handler correspondente nunca é invocado (testado explicitamente: a flag `executed` permanece `false`).
- **Validação antes da execução:** Stage 1 (Validate) roda antes de Stage 2/3 — um payload inválido bloqueia tanto a autorização quanto a execução.
- **Falhas de dependência:** ausência de qualquer engine exigido pela definição resolvida (Action, Workflow, Validation quando `payload.validation` declarado, Permission quando `payload.permission` declarado) retorna `MAK-L3-EXECUTION-004` de forma determinística — nunca executa "no escuro" assumindo permissão/validação implícita.
- **Falhas de action/workflow:** erros do handler de Action (`MAK-L3-ACTION-006`) ou instância de Workflow marcada `failed` são propagados como `UecResponse.error`/`data.instance` — nunca lançados como exceção pelo Execution Engine, preservando o contrato `Promise<UecResponse>` (nunca `Promise` rejeitada para falha de negócio esperada).
- **Ausência de engine obrigatória:** verificado explicitamente por 4 testes dedicados (Action, Workflow, Validation-quando-exigida, Permission-quando-exigida) — todos retornam `MAK-L3-EXECUTION-004` sem nunca invocar um handler.
- **Bloqueio por contexto inválido:** `ctx` nulo ou não-objeto é rejeitado estruturalmente (`MAK-L3-EXECUTION-002`) antes de qualquer estágio do pipeline rodar.
- **Tipo de execução desconhecido nunca executa silenciosamente:** verificado estaticamente (teste) e dinamicamente (gate G423-16, que instancia o engine com um registry vazio e confirma que um tipo desconhecido retorna `MAK-L3-EXECUTION-003` em vez de um resultado de sucesso).

## Determinismo

- **Mesma entrada produz mesmo resultado:** testado explicitamente — duas chamadas de `execute()` com o mesmo `UecRequest` (tipo `action`, sem timestamps envolvidos) produzem `UecResponse` estritamente iguais.
- **Engine não cria side effects próprios:** `ExecutionEngine` não persiste nada, não muta a definição resolvida, não muta o registry, não muta o `ctx` recebido.
- **Engine só delega para engines já existentes:** toda mutação de estado observável (instância de workflow, resultado de action) acontece dentro de M10/M11, que já são responsáveis por ela desde C.6/C.7 — o Execution Engine apenas encaminha `payload`/`ctx` e traduz o resultado para `UecResponse`.
- **Falha estrutural vs falha de negócio:** falha estrutural (registry inválido no construtor) lança `ExecutionError`; toda falha de negócio esperada (tipo desconhecido, dependência ausente, permissão negada, validação falhada, falha do handler delegado) é retornada como `UecResponse.success === false`, nunca lançada.

## Códigos de erro

| Código | Significado |
|---|---|
| `MAK-L3-EXECUTION-001` | `ExecutionEngine` construído sem um registry válido (`IRegistry`) — lançado pelo construtor. |
| `MAK-L3-EXECUTION-002` | `UecRequest` inválido (tipo ausente/inválido, `kind` inválido, `payload` ausente) ou `ctx` inválido (nulo/não-objeto) — retornado em `UecResponse.error`. |
| `MAK-L3-EXECUTION-003` | Tipo de execução não roteável (namespace diferente de `action.`/`workflow.`) ou handler/definição inexistente no registry — retornado em `UecResponse.error`. |
| `MAK-L3-EXECUTION-004` | Engine obrigatória (Action, Workflow, Validation quando exigida, Permission quando exigida) não wired — retornado em `UecResponse.error`. |
| `MAK-L3-EXECUTION-005` | Execução negada pelo Permission Engine (Stage 2 Authorize) — retornado em `UecResponse.error`. |
| `MAK-L3-EXECUTION-006` | Payload rejeitado pelo Validation Engine (Stage 1 Validate), ou a própria validação falhou ao rodar — retornado em `UecResponse.error`, com o `ValidationResult` completo em `data.validation`. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-16.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `core/execution/`.
- Runtime consome registry hidratado — `ExecutionEngine` só usa `registry.has()`/`registry.resolve()` sobre o `IRegistry` já populado (buckets CRB `action`/`workflow`, já existentes e usados sem modificação).
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código do novo módulo.
- C.12 State não foi iniciado — nenhum diretório `core/state/`, nenhuma classe `StateEngine`.
- Transaction Engine não foi iniciado — nenhum diretório `core/transaction/`, nenhuma classe `TransactionEngine`/`TransactionManager`.

## Débitos técnicos controlados

- **Stage 4 (Audit) sem sink real:** nenhum log estruturado é produzido — depende de M24 Observability (C.17), que ainda não existe. Documentado como extensão futura, não como falha.
- **Emissão de eventos pós-commit (RT-C-15, M16 → M22) não implementada:** `UecResponse.events` permanece um slot estrutural não populado — depende de M22 Event Bus (C.15), que ainda não existe.
- **Persistência de estado real fica para C.12/C.16, se aplicável:** M17 State Engine (route-scoped state, USM transitions) e M23 Transaction Manager (unit of work BE, rollback) são consumidores/colaboradores futuros do resultado de M16 — nenhuma integração prematura foi criada.
- **Transações ficam fora do C.11:** não há wrap de transação (`requiresTx`) ao redor da chamada delegada — cada handler (Action/Workflow) permanece responsável por sua própria atomicidade, como já era antes deste slice.
- **Execução distribuída/externa fica fora do C.11:** `ExecutionEngine` opera inteiramente em processo, sobre engines já hidratadas localmente — nenhuma chamada remota.
- **Retry/circuit breaker ficam fora do C.11:** nenhuma política de retry é aplicada sobre falhas do Action/Workflow Engine — a falha é reportada uma única vez, de forma determinística.

## Conclusão

O C.11 está apto para merge do ponto de vista de qualidade: orquestrador fail-safe e determinístico do pipeline UP-09 (Validate → Authorize → Execute → Respond), roteamento por namespace O(1) fiel ao Universal Handler, delegação total às engines já existentes (M09/M10/M11/M15) sem duplicação de lógica, nenhuma exceção lançada para condições esperadas, ausência de qualquer engine obrigatória sempre detectada e reportada de forma previsível, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, sem antecipar State/Transaction/Plugin Engine, com regressão completa (G423-01–15 + G423-20) verde.
