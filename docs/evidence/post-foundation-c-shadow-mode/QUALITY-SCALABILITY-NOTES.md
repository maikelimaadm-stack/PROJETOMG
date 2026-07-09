# QUALITY & SCALABILITY NOTES — POST-FOUNDATION C SHADOW MODE

## Objetivo

Explicar o Runtime v2 Shadow Mode e seus limites — uma camada de diagnóstico paralelo, opt-in e desligável, que roda o runtime v2 ao lado do runtime legado sem controlar a UI de produção.

## Escalabilidade

- **Custo de um shadow pass (`runShadowPass`):** dominado por `loadRuntime()` (fornecido pelo host — tipicamente um `loadRuntimeBundle`), mais O(24) para `checkReadiness()` (tamanho fixo do `MODULE_REGISTRY` do Runtime Completion) e O(1) para gravar o registro de diagnóstico. Quando desligado, o custo é O(1) — apenas a validação do input e o retorno `{ skipped: true }`.
- **Custo de diagnostics (`getDiagnostics`):** O(registros bufferizados) — clona profundamente cada registro; o buffer é limitado por `MAX_DIAGNOSTICS = 500`.
- **Custo de comparação de snapshots (`compareWithLegacy`):** O(chaves de topo × custo de `JSON.stringify` por valor), limitado por `MAX_COMPARE_KEYS = 200` chaves e `MAX_SNAPSHOT_DEPTH = 8` de profundidade — snapshots patológicos são rejeitados antes da comparação.
- **Limites de payload/snapshot:** `MAX_INPUT_DEPTH = 8` (input de pass), `MAX_SNAPSHOT_DEPTH = 8` (redução/mascaramento), `MAX_COMPARE_KEYS = 200` (comparação), `MAX_DIAGNOSTICS = 500` (buffer) — nenhuma dimensão fica sem teto.
- **Impacto esperado na UI quando DESLIGADO:** zero — `enabled: false` faz `runShadowPass()` retornar imediatamente sem construir runtime v2, sem gravar diagnósticos, sem tocar o runtime legado. É seguro embarcar em produção desligado.
- **Impacto esperado quando LIGADO:** o custo de um `loadRuntimeBundle` v2 adicional por pass, executado fora do caminho de render da UI. Como não há render real nem side effect, o impacto visual é nulo; o impacto de CPU/memória é limitado pelos tetos acima e controlável pela frequência de passes que o host decidir agendar.

## Segurança / Fail-safe

- **Opt-in:** `enabled: false` por padrão; nada roda até o host explicitamente ligar. `clear()` está disponível como off switch adicional para descartar diagnósticos acumulados.
- **Falha isolada:** uma falha do runtime v2 durante um pass é capturada em `{ success: false, error }` e (quando o Observability está injetado) registrada via `captureError()` — nunca lançada para o chamador, portanto nunca pode derrubar a UI de produção. Verificado por teste e pelo gate (checagem comportamental dinâmica).
- **Sem side effect:** o adaptador nunca invoca `dispatch`/`start`/`execute` de Action/Workflow/Connector — apenas inspeciona presença de módulos via Runtime Completion. Testado explicitamente com engines falsos que contam side effects (contagem permanece zero).
- **Sem render real:** nenhuma importação de `react`/`react-dom`, nenhum acesso a `document`/`window`, nenhuma chamada de `render()`. Verificado por teste e pelo gate.
- **Sem action/workflow/connector real:** ver "sem side effect".
- **Dados sensíveis mascarados:** qualquer chave correspondente a `/password|token|secret|api[-_]?key|authorization|cookie|credential/i` é substituída por `'[REDACTED]'` em diagnósticos e nos valores reportados por `compareWithLegacy`. A comparação de igualdade é feita sobre os valores crus (para detectar diferenças reais em campos sensíveis), mas o que sai do adaptador é sempre mascarado.
- **Poluição de protótipo bloqueada:** `__proto__`/`constructor`/`prototype` em qualquer nível de um input de pass ou de um snapshot de comparação lançam `MAK-L3-SHADOW-001`. Testado.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, caminho de `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`, `BroadcastChannel`, `localStorage`/`sessionStorage`/`IndexedDB`. Verificado por teste e pelo gate G423-SHADOW.

## Determinismo

- **Mesma entrada produz relatório equivalente:** `compareWithLegacy` com as mesmas entradas retorna o mesmo conjunto de `differences`/`onlyInLegacy`/`onlyInV2`; `checkReadiness` sobre o mesmo runtime retorna a mesma disponibilidade de módulos. O clock é injetável para timestamps determinísticos em teste.
- **Diagnostics são cópias seguras:** `getDiagnostics()` retorna clones profundos — mutar o valor retornado (push de registros, alteração de `detail`) nunca afeta o estado interno. Testado explicitamente.
- **Runtime legado não é alterado:** o adaptador apenas **lê** um snapshot do runtime legado (ex.: `getRuntimeBridgeStatus()`) para comparação — nunca escreve, nunca hidrata, nunca invalida o cache do bridge.

## Códigos de erro

| Código | Significado |
|---|---|
| `MAK-L3-SHADOW-001` | Input de pass ou snapshot de comparação com poluição de protótipo (`__proto__`/`constructor`/`prototype`) ou profundidade excedida. |
| `MAK-L3-SHADOW-002` | Opção de construtor inválida (`clock` ou `loadRuntime` fornecidos mas não são função). |
| `MAK-L3-SHADOW-003` | `compareWithLegacy()` chamado com argumento não-objeto, ou snapshot excedendo `MAX_COMPARE_KEYS`. |
| `MAK-L3-SHADOW-004` | Buffer de diagnósticos excedeu `MAX_DIAGNOSTICS`. |

(Falhas de execução do runtime v2 — ex.: `loadRuntime` que lança — nunca usam estes códigos; são retornadas em `ShadowPassResult.error`, nunca lançadas.)

## Débitos técnicos controlados

- **Ainda não integra tela piloto:** nenhuma tela real habilita o Shadow Mode neste slice; a habilitação por flag para um módulo piloto é o próximo passo.
- **Ainda não substitui runtime legado:** o runtime legado permanece o único que serve a UI; o Shadow Mode é estritamente diagnóstico paralelo.
- **Ainda não executa produção real:** nenhum comportamento de usuário passa pelo runtime v2.
- **Comparação semântica profunda fica para próximo slice:** `compareWithLegacy` faz comparação estrutural (chaves de topo + igualdade por `JSON.stringify` limitada em profundidade), não uma reconciliação semântica campo-a-campo de layouts/validações/workflows entre legado e v2.
- **Integração por módulo fica para próximo slice:** um adaptador que produza snapshots comparáveis a partir do estado real de um módulo hidratado (legado vs v2) não faz parte deste slice.

## Conclusão

O Shadow Mode está apto para merge do ponto de vista de qualidade: camada de diagnóstico paralelo opt-in e desligável, sem impacto quando desligada, sem render/side effect/action-workflow-connector real quando ligada, com falha do runtime v2 sempre isolada como dado, dados sensíveis mascarados, poluição de protótipo bloqueada, limites explícitos em todas as dimensões, cópias profundas seguras, determinismo via clock injetável, runtime legado e Foundation C completamente preservados, e sem qualquer dependência de Prisma/backend/MMM direto.
