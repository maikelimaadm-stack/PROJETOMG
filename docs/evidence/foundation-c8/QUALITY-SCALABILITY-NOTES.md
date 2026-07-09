# QUALITY & SCALABILITY NOTES — FOUNDATION C.8

## Slice

Foundation C.8 — M12 Render Engine

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do M12 Render Engine.

## Escalabilidade

- **Comportamento com muitas telas/definições:** cada tela é um registro independente no registry `layout` (chave = `code`), resolvido por lookup direto (`Map` interno da `RegistryManager`, O(1) amortizado). O número de telas cadastradas não afeta o custo de renderizar uma tela específica — não há varredura linear sobre todas as telas.
- **Custo de lookup no registry:** `registry.has()`/`registry.resolve()` são O(1) por chamada. Para um layout com `n` campos declarados, o custo total é O(n) — um lookup de `field` por campo, mais uma chamada a `PermissionEngine.can()` por campo que declara `permission` (também O(1) por decisão, delegada e não reimplementada).
- **Custo de travessia da árvore:** a árvore produzida neste slice tem profundidade fixa e pequena (`root` → lista plana de `RenderFieldNode`), portanto a "travessia" é uma única passada O(n) sobre os campos — não há recursão nem aninhamento profundo.
- **Limites contra árvore profunda/cíclica:** o modelo de dados atual (lista plana de campos, sem referências entre nós) não permite ciclos estruturalmente — não existe um ponteiro "filho aponta pro pai" possível de se criar aqui. Como salvaguarda defensiva mesmo assim, foi adicionado um teto explícito (`MAX_FIELDS_PER_LAYOUT = 256`): um layout que declare mais campos que isso falha com `MAK-L3-RENDER-004` antes de qualquer processamento, evitando custo O(n) descontrolado em uma definição patológica/mal gerada. Quando o Render Engine evoluir para árvores realmente aninhadas (ex.: grupos/seções em C.17+), esse limite deve evoluir para um guard de profundidade recursiva (`maxDepth`) análogo ao já usado em M07 Dependency Resolver (`DependencySorter.maxDepth`).
- **Estratégia para render futuro real:** o `RenderTree` produzido aqui é dado puro (sem React), pensado para ser consumido por um adapter de host (ex.: `React.createElement` recursivo sobre `root.children`) em um slice futuro — a árvore já está no formato certo para isso, sem exigir reestruturação.

## Segurança / Fail-safe

- **Como permissões são delegadas ao M09:** `RenderEngine` nunca reimplementa a matriz deny/allow/default-deny — cada campo com `permission` declarado é checado via `PermissionEngine.can(action, resource, ctx)`, a mesma instância usada por `Router.canActivate()` (C.5) e `ActionEngine`/`WorkflowEngine` (C.6/C.7).
- **Como elementos negados são tratados:** removidos da árvore (`children`/`fields` não os inclui) — nunca aparecem com uma flag "disabled" visível; a UI simplesmente não recebe o nó.
- **Como componente desconhecido falha:** se um campo declarar `component` explicitamente e o valor não estiver na allowlist (`TextCell`, `NumberCell`, `BooleanCell`, `DateCell`), lança `RenderError` (`MAK-L3-RENDER-005`) antes de montar a árvore — nunca renderiza um componente arbitrário/não whitelisted.
- **Como árvore inválida falha:** `fields` que não seja array, referências de campo sem `field` válido, referência a um `field` inexistente no registry, ou volume de campos acima do teto — todos lançam `RenderError` (`MAK-L3-RENDER-004`) antes de qualquer processamento parcial vazar.
- **Sem engine de permissão wired:** campos que não declaram permissão continuam públicos (comportamento correto); campos que declaram permissão mas não há `PermissionEngine` disponível são omitidos por padrão (fail-closed).
- **Erro do engine de permissão em runtime:** qualquer exceção lançada por `can()` é capturada e tratada como "não visível" — nunca vira uma falha não tratada nem um "allow" acidental.

## Determinismo

- **Mesma entrada produz mesma render tree:** testado explicitamente (`assert.deepEqual` sobre duas chamadas com o mesmo registry/ctx) — não há timestamps, IDs aleatórios, nem qualquer fonte de não-determinismo na árvore retornada.
- **Render não executa actions/workflows automaticamente:** `actionRef`/`workflowRef` são strings passadas adiante como metadado; testado com engines "fake" instrumentados que devem permanecer não invocados mesmo com a metadata presente.
- **Render não produz efeitos colaterais:** nenhuma escrita em registry, nenhuma mutação de estado global, nenhuma chamada de rede/disco — `render()` é uma função pura sobre `(registry congelado, permissionEngine, screenId, ctx)`.

## Códigos de erro

| Código | Significado |
|---|---|
| `MAK-L3-RENDER-001` | `RenderEngine` construído sem um registry válido (`IRegistry`) — erro de wiring/setup. |
| `MAK-L3-RENDER-002` | Chamada inválida: `screenId` vazio/inválido em `render()`, ou `viewMode`/`adapter` inválido em `registerAdapter()`. |
| `MAK-L3-RENDER-003` | Tela/layout inexistente — nenhum registro `layout` para o `screenId` informado. |
| `MAK-L3-RENDER-004` | Árvore/definição inválida: `fields` não é array, referência de campo malformada, campo referenciado não existe no registry `field`, ou número de campos acima do teto (`MAX_FIELDS_PER_LAYOUT`). |
| `MAK-L3-RENDER-005` | Componente explícito desconhecido — valor de `component` fora da allowlist suportada. |
| `MAK-L3-RENDER-006` | Nenhum adapter registrado para o `viewMode` resolvido da tela. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-12.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API dentro de `core/render/`.
- Runtime consome registry hidratado — `render()` só usa `registry.has()`/`registry.resolve()` sobre o `IRegistry` já populado por M04/M06.
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`; automatizado no gate G423-12.
- Studio/Marketplace não foram tocados — nenhuma referência em `core/render/renderEngine.js` (verificado por teste + gate).

## Débitos técnicos controlados

- **Render real React/DOM fica fora do C.8** — o `RenderTree` é dado puro; o mount real em `ReactDOM`/JSX é trabalho de um host consumer futuro, fora do escopo do runtime v2.
- **Integração visual com telas reais fica para slice futuro** — a lista `empresas` em produção continua servida pelo runtime legado (`framework/mak` + `makBootstrap/runtimeBridge`); nenhuma migração de tela real ocorreu neste slice.
- **Otimização/caching avançado fica para slice futuro, se aplicável** — hoje cada `render()` recalcula a árvore do zero (custo O(n) já é baixo o suficiente para o volume atual de campos); memoização por `screenId`+`ctx` pode ser adicionada quando/se o volume justificar, sem mudança de contrato público.
- **Guard de ciclo real (grafo, não lista)** — hoje não é estruturalmente possível (lista plana), mas deve ser revisitado quando `RenderTree` ganhar aninhamento real (seções, grupos, sub-telas), usando a mesma técnica de `maxDepth`/detecção de ciclo já validada em M07.

## Conclusão

O C.8 está apto para merge do ponto de vista de qualidade: fail-closed em todos os caminhos de decisão, determinístico, sem efeitos colaterais, sem execução automática de Action/Workflow, sem dependência de Prisma/MMM/backend, sem tocar UI de produção, e com regressão completa (G423-01–11 + G423-20) verde. Os débitos listados são explícitos, delimitados e não bloqueiam a certificação deste slice — são, por definição, escopo de slices futuros (C.9 em diante).
