# QUALITY & SCALABILITY NOTES — SHADOW PILOT EMPRESAS

## Objetivo

Explicar o piloto shadow do módulo Empresas — a primeira integração real, passiva e opt-in entre um módulo de produção (Empresas / CadastroEmpresas) e o runtime v2, via `RuntimeShadowMode`, sem controlar a tela.

## Escalabilidade

- **Custo de snapshot legado (`createLegacySnapshot`):** O(campos) — mapeia e ordena os field descriptors por id; sem I/O, sem render, sem acesso a dados reais. O descritor padrão tem ~10 campos; a ordenação é O(n log n) trivial.
- **Custo de snapshot v2 (`createRuntimeV2Input`):** O(campos) — idem, mais uma consulta O(1) por campo no mapa de tipos canônicos (`V2_TYPE_MAP`).
- **Custo de um shadow pass (`run`):** dominado pela `compareWithLegacy` do RuntimeShadowMode (O(chaves de topo × custo de `JSON.stringify`), limitado por `MAX_COMPARE_KEYS`) mais o `runShadowPass` (readiness O(24) via Runtime Completion). Quando desligado, o custo é O(1) — validação de input + retorno `{ skipped: true }`.
- **Custo de comparação:** estrutural, limitada em profundidade e número de chaves pelos tetos do próprio RuntimeShadowMode.
- **Impacto esperado com a flag DESLIGADA:** zero — `run()` retorna imediatamente sem construir snapshot, sem comparar, sem gravar diagnóstico, sem tocar o runtime legado ou a UI. Seguro para embarcar em produção desligado.
- **Impacto esperado com a flag LIGADA:** o custo de construir dois snapshots estruturais pequenos e uma comparação, executado fora do caminho de render da tela Empresas. Sem render real, sem side effect, o impacto visual é nulo; o impacto de CPU/memória é limitado pelos tetos e pela frequência de `run()` que o host decidir.

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_SHADOW_EMPRESAS` só liga quando exatamente `'true'`; `options.enabled` explícito tem precedência. `clear()` como off switch adicional.
- **Falha isolada:** uma falha do RuntimeShadowMode (ou qualquer erro interno durante o `run()`) é capturada em `{ ok: false, error }` e (com Observability injetado) registrada via `captureError()` — nunca lançada para o chamador, portanto nunca pode quebrar a tela Empresas. Verificado por teste e pelo gate (checagem comportamental dinâmica).
- **Sem side effect:** o piloto nunca renderiza UI, nunca executa salvar/editar/excluir, nunca invoca `dispatch`/`start`/`execute` de Action/Workflow/Connector — apenas constrói snapshots estruturais e inspeciona presença de módulos. Testado com engines falsos que contam side effects (contagem = 0).
- **Sem render real:** nenhuma importação de `react`/`react-dom`, nenhum acesso a `document`/`window`, nenhuma chamada de `render()`. Verificado por teste e gate.
- **Sem salvar/editar/excluir:** o piloto opera apenas sobre descritores estruturais (ids/tipos/required), nunca sobre dados de empresa reais nem sobre o repositório.
- **Dados sensíveis mascarados:** qualquer chave correspondente a `/password|token|secret|api[-_]?key|authorization|cookie|credential/i` é mascarada em snapshots e diagnósticos.
- **Poluição de protótipo bloqueada:** `__proto__`/`constructor`/`prototype` em qualquer nível do input lançam `MAK-L3-SHADOW-PILOT-001`. Testado.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`, `BroadcastChannel`, `localStorage`/`sessionStorage`/`IndexedDB`. Verificado por teste e gate.
- **Desacoplamento runtime→módulo:** o piloto não importa `src/modules/empresas/*` nem `src/App.jsx` — verificado por teste e gate.

## Determinismo

- **Mesma entrada produz diagnóstico equivalente:** `createLegacySnapshot`/`createRuntimeV2Input` ordenam campos por id e produzem estruturas `deepEqual` para a mesma entrada; a comparação é determinística; o clock é injetável para timestamps determinísticos em teste.
- **Diagnostics são cópias seguras:** `getDiagnostics()` retorna clones profundos — mutar o retorno (push de registros, alteração de `detail`) nunca afeta o estado interno. Testado.
- **Runtime legado não é alterado:** o piloto apenas **modela** estruturalmente o que o runtime legado representa — nunca escreve, hidrata, ou invalida o cache do bridge.

## Códigos de erro

| Código | Significado |
|---|---|
| `MAK-L3-SHADOW-PILOT-001` | Input com poluição de protótipo (`__proto__`/`constructor`/`prototype`), profundidade excedida, ou descritor não-objeto. |
| `MAK-L3-SHADOW-PILOT-002` | Opção de construtor inválida (`clock`/`descriptor`), ou buffer de diagnósticos excedendo `MAX_DIAGNOSTICS`. |

(Falha de execução do RuntimeShadowMode durante `run()` nunca usa estes códigos; é retornada em `EmpresasShadowPilotReport.error`, nunca lançada.)

## Débitos técnicos controlados

- **Ainda não substitui a tela Empresas:** a UI atual continua servida exclusivamente pelo runtime legado.
- **Ainda não controla table/form real:** o piloto opera sobre um descritor estrutural canônico, não sobre o render vivo da table/form de Empresas.
- **Ainda não executa ações reais:** nenhum salvar/editar/excluir nem action/workflow/connector é executado.
- **Ainda não altera UX:** nenhuma mudança visual ou de comportamento do usuário.
- **Field defs vivos ficam para próximo slice:** o descritor canônico embarcado espelha `EMP_FORM_FIELD_DEFS`; um hook passivo entregando os field defs vivos em runtime (sem controlar render) é o próximo passo.
- **Integração visual fica para próximo slice:** nenhuma integração com o render da tela.

## Conclusão

O piloto shadow de Empresas está apto para merge do ponto de vista de qualidade: integração passiva, opt-in e desligável, sem impacto quando desligada, sem render/side effect/salvar-editar-excluir/action-workflow-connector real quando ligada, com falha do shadow sempre isolada como dado, dados sensíveis mascarados, poluição de protótipo bloqueada, limites explícitos, cópias profundas seguras, determinismo via ordenação estável e clock injetável, desacoplamento runtime→módulo garantido, e runtime legado / UI de produção / Foundation C completamente preservados, sem qualquer dependência de Prisma/backend/MMM direto.
