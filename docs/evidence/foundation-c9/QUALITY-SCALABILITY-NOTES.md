# QUALITY & SCALABILITY NOTES — FOUNDATION C.9

## Slice

Foundation C.9 — M13/M14 Expression + Formula Engine

## Objetivo

Explicar qualidade, segurança, escalabilidade, limites e riscos dos motores de expressão e fórmula.

## Segurança / Sandbox

- **Ausência de `eval`/`new Function`:** o `ExpressionEngine` avalia expressões via um tokenizer + parser recursivo-descendente próprio, que constrói uma AST e a percorre com um `switch` — nenhum código dinâmico é construído ou executado. Verificado por teste automatizado (busca por `eval(`/`new Function(` no código-fonte) e pelo gate G423-13 (mesma checagem via regex).
- **Bloqueio de globais/prototype/constructor:** cada segmento de um identificador (`data.valor`, `record.x`) é checado contra uma blocklist (`__proto__`, `constructor`, `prototype`, `globalThis`, `global`, `window`, `document`, `process`, `Function`, `require`, `module`, `exports`, `eval`) **em tempo de parse** — antes de qualquer avaliação. Além disso, a resolução de propriedades usa `Object.prototype.hasOwnProperty.call`, nunca acesso "solto" que pudesse subir a cadeia de protótipo.
- **Funções allowlist:** somente `min`, `max`, `round`, `abs`, `coalesce` são chamáveis — qualquer outro nome de função lança `MAK-L3-EXPRESSION-004`. Não há mecanismo para o autor da expressão registrar ou invocar funções arbitrárias.
- **Erro previsível para sintaxe/identificador/função inválida:** todo caminho de falha (token não reconhecido, token inesperado, identificador ausente do binding, função fora da allowlist, profundidade/tamanho excedido) lança um `ExpressionError` tipado com um dos 5 códigos — nunca retorna `undefined` silenciosamente nem lança uma exceção genérica do JS.

## Escalabilidade

- **Custo de avaliação de expressão:** O(n) no tamanho da string de entrada para tokenização + parsing, e O(tamanho da AST) para avaliação — sem recomputação, sem cache necessário para expressões individuais (são tipicamente curtas).
- **Limite de profundidade/tamanho:** `maxExpressionLength` (padrão 500 caracteres) e `maxDepth` (padrão 32 níveis) são configuráveis por instância e checados antes/durante o parse. Nota de calibração: a gramática de precedência (Or→And→Equality→Comparison→Additive→Multiplicative→Unary→Primary) já consome ~8 níveis de profundidade por padrão, mesmo para uma expressão trivial — então o limite é conservador por natureza (superestima "profundidade real do autor"), o que é aceitável para uma salvaguarda de segurança (prefere bloquear cedo a permitir recursão descontrolada). Com o padrão de 32, expressões legítimas (mesmo com parênteses aninhados razoáveis) têm margem confortável.
- **Custo de resolução de fórmulas:** O(número de dependências) por fórmula computada, com cache (`resolved` Map) compartilhado entre chamadas de uma mesma `compute()`/`computeBatch()` — uma fórmula referenciada por múltiplas outras é computada uma única vez.
- **Limite de dependências:** `MAX_DEPENDENCIES = 32` por fórmula — declarar mais que isso falha com `MAK-L3-FORMULA-005` antes de qualquer resolução.
- **Detecção de ciclos:** um `Set` `inProgress` por chamada de `compute()`/`computeBatch()` marca fórmulas em resolução; revisitar uma fórmula já marcada lança `MAK-L3-FORMULA-004` imediatamente — custo O(1) por checagem, sem necessidade de construir um grafo completo antecipadamente.
- **Comportamento com muitas fórmulas:** cada fórmula é um registro independente no registry (`handler`, chave = código), resolvido por lookup O(1) — o número total de fórmulas cadastradas não afeta o custo de computar uma fórmula específica.

## Determinismo

- **Mesma entrada produz mesma saída:** testado explicitamente em ambos os engines (`assert.equal`/`assert.deepEqual` sobre chamadas repetidas com os mesmos argumentos).
- **Sem side effects:** nem `ExpressionEngine` nem `FormulaEngine` mutam registry, estado global, ou qualquer objeto passado por referência além de ler suas propriedades.
- **Sem execução de Action/Workflow/Render:** nenhum dos dois módulos importa ou referencia `ActionEngine`, `WorkflowEngine` ou `RenderEngine` — verificado por teste (busca textual no código-fonte) e pelos gates G423-13/G423-14.
- **Sem chamadas externas:** nenhuma rede, disco, ou timer — avaliação e cálculo são funções puras sobre os argumentos recebidos.

## Códigos de erro

### ExpressionError

| Código | Significado |
|---|---|
| `MAK-L3-EXPRESSION-001` | Configuração inválida do engine (`maxExpressionLength`/`maxDepth` não é inteiro positivo). |
| `MAK-L3-EXPRESSION-002` | Erro de sintaxe — token não reconhecido, token inesperado, ou expressão vazia/não-string. |
| `MAK-L3-EXPRESSION-003` | Identificador desconhecido — segmento de path não existe no binding, ou é um segmento bloqueado (`__proto__`, `constructor`, etc.). |
| `MAK-L3-EXPRESSION-004` | Função desconhecida — nome fora da allowlist (`min`, `max`, `round`, `abs`, `coalesce`). |
| `MAK-L3-EXPRESSION-005` | Expressão excede o limite de tamanho ou de profundidade configurado. |

### FormulaError

| Código | Significado |
|---|---|
| `MAK-L3-FORMULA-001` | `FormulaEngine` construído sem um registry válido (`IRegistry`). |
| `MAK-L3-FORMULA-002` | Fórmula inválida — entrada do registry sem `payload.expr` válido, ou a expressão falhou ao avaliar. |
| `MAK-L3-FORMULA-003` | Fórmula ou dependência inexistente — código não encontrado no registry `handler`. |
| `MAK-L3-FORMULA-004` | Ciclo detectado entre fórmulas (dependência circular). |
| `MAK-L3-FORMULA-005` | Fórmula declara mais dependências que o limite (`MAX_DEPENDENCIES = 32`). |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex nos gates G423-13/G423-14.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `core/expression/` ou `core/formula/`.
- Runtime consome registry hidratado — `FormulaEngine` só usa `registry.has()`/`registry.resolve()` sobre o `IRegistry` já populado por M04/M06 (bucket CRB `formula` → tipo `handler`, mapeamento pré-existente, não uma invenção deste slice).
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência a Studio/Marketplace no código dos dois novos módulos (verificado por teste).

## Débitos técnicos controlados

- **Sintaxe suportada neste slice:** literais (string/number/boolean/null), identificadores com path pontilhado, aritmética básica, comparação, booleanos com curto-circuito, chamadas de função allowlist, agrupamento por parênteses. **Não suportado:** arrays/objetos literais, indexação `[]`, operador ternário `?:`, template strings, spread. Ampliar a gramática é trabalho de slice futuro, se necessário.
- **Funções allowlist iniciais:** apenas 5 (`min`, `max`, `round`, `abs`, `coalesce`). Novas funções devem ser adicionadas de forma explícita e revisada — nunca por injeção dinâmica.
- **Otimização/cache futuro:** hoje cada `evaluate()`/`compute()` reprocessa a expressão do zero (tokenize+parse); cachear ASTs por string de expressão (memoização) é uma otimização futura de baixo risco, se o volume justificar.
- **Integração mais profunda com Render/Validation fica para slices futuros:** `M12 RenderEngine` ainda não invoca `ExpressionEngine`/`FormulaEngine` para resolver bindings de campo (isso é o passo RT-7.2 do bootstrap sequence, propositalmente não wireado neste slice); `M15 Validation Engine` (C.10) é o próximo consumidor natural.
- **Adapter G302 (D-RI-10) não implementado:** o SSOT (`08-DONE-CRITERIA.md`, `04-MODULE-CONTRACTS.md` RT-C-13) pede reuso do Computation Engine G302 (frozen, em `src/studio/computation/`) via adapter. Como este slice tem instrução explícita de não tocar Studio, foi implementado um motor novo e autocontido em vez de um adapter sobre G302. Isso é uma divergência documentada e rastreada, não uma omissão silenciosa — a integração com G302 pode ser revisitada em um slice futuro com escopo e autorização explícitos para tocar Studio.

## Conclusão

O C.9 está apto para merge do ponto de vista de qualidade: sandbox real (sem `eval`/`new Function`, sem acesso a globais/prototype/constructor), determinístico, sem efeitos colaterais, sem execução automática de Action/Workflow/Render, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, com regressão completa (G423-01–12 + G423-20) verde. A única divergência de contrato (não uso do adapter G302) é explícita, documentada e não bloqueia a certificação — é uma decisão de escopo forçada pela regra "não tocar Studio" desta sessão, não uma falha técnica.
