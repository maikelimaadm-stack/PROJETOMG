# QUALITY & SCALABILITY NOTES — FOUNDATION C.10

## Slice

Foundation C.10 — M15 Validation Engine

## Objetivo

Explicar qualidade, segurança, escalabilidade, limites e riscos do Validation Engine.

## Segurança / Sandbox

- **Ausência de `eval`/`new Function`:** confirmado por teste automatizado (busca textual no código-fonte) e pelo gate G423-15.
- **Uso do Expression Engine para `custom`:** toda avaliação de expressão passa por `this._expressionEngine.validate()` (checagem de sintaxe, estrutural) e `.evaluate()` (avaliação de dado) — o `ValidationEngine` nunca implementa seu próprio parser/avaliador. Verificado por teste e pelo gate (busca por `_expressionEngine` no código).
- **Regras inválidas não aprovam silenciosamente:** toda regra estruturalmente malformada (nome desconhecido, parâmetro obrigatório ausente, regex inválida, lista de enum vazia/ausente, expressão custom com sintaxe inválida ou maior que o limite) **lança** `ValidationError` — nunca retorna `{valid:true}` por omissão. O gate G423-15 executa um teste dedicado instanciando o engine com um registry vazio e confirmando que uma regra desconhecida lança em vez de passar.
- **Sem execução de Action/Workflow/Render:** nenhuma referência a esses módulos no código-fonte — verificado por teste e pelo gate.
- **Sem chamadas externas:** nenhuma rede, disco, timer, ou consulta a Prisma/MMM — `ValidationEngine` opera inteiramente sobre os argumentos recebidos e o registry já hidratado.

## Escalabilidade

- **Custo por campo:** O(1) para localizar o valor do campo no record (`record[field]`); O(número de regras daquele campo) para avaliá-lo.
- **Custo por regra:** O(1) para a maioria dos tipos (`required`, `type`, `min`, `max`, `enum`); O(tamanho do valor) para `minLength`/`maxLength`/`pattern` (comparação/regex sobre a string); O(tamanho da expressão) para `custom` (delegado ao Expression Engine, já documentado em C.9).
- **Limites de regras/campos:** `MAX_RULES_PER_FIELD = 16`, `MAX_FIELDS_PER_VALIDATION = 64` — excedidos lançam `MAK-L3-VALIDATION-004` antes de qualquer avaliação parcial.
- **Limites de pattern/expression:** `MAX_PATTERN_LENGTH = 200` (regex), `MAX_CUSTOM_EXPRESSION_LENGTH = 300` (expressão custom) — ambos checados antes de compilar/avaliar, evitando regex patológica (ReDoS) ou expressões desproporcionalmente grandes.
- **Comportamento com muitos campos:** `validateRecord()` agrupa as regras por campo uma única vez (O(total de regras) para agrupar) e então processa cada grupo — o custo total é linear no número de regras declaradas, não quadrático.

## Determinismo

- **Mesma entrada produz mesma saída:** testado explicitamente (regras idênticas + mesmos dados → mesmo `ValidationResult`).
- **Ordem estável de erros:** `validateRecord()` preserva a ordem de declaração das regras no registry (iteração sobre `Map` que preserva ordem de inserção em JS) — testado explicitamente com 3 campos declarados em ordem `a, b, c`.
- **Sem side effects:** nenhuma mutação do registry, do record recebido, ou de qualquer estado global.
- **Sem execução externa:** nenhuma chamada de Action/Workflow/Render/backend durante a validação.

## Códigos de erro

### ValidationError (estrutural — sempre lançado, nunca retornado em `errors[]`)

| Código | Significado |
|---|---|
| `MAK-L3-VALIDATION-001` | `ValidationEngine` construído sem um registry válido (`IRegistry`). |
| `MAK-L3-VALIDATION-002` | Recurso/campo de validação inexistente no registry (`validateRecord`/`validateField` com código desconhecido). |
| `MAK-L3-VALIDATION-003` | Regra malformada ou desconhecida — nome de regra não suportado, parâmetro obrigatório ausente (`min`/`max` sem `value`, `minLength`/`maxLength` sem `length`, `pattern` sem `pattern`, `enum` sem `values`, `custom` sem `expr`), regex inválida, ou expressão `custom` com erro de sintaxe. |
| `MAK-L3-VALIDATION-004` | Limite excedido — regras por campo, campos por validação, tamanho de pattern, ou tamanho de expressão custom. |

### Entrada de falha de dado (nunca lança — sempre retornada em `errors[]`/`warnings[]`)

| Código | Significado |
|---|---|
| `MAK-L3-VALIDATION-RULE-FAILED` | O valor não satisfaz uma regra bem-formada (obrigatório vazio, tipo incorreto, fora do intervalo min/max, comprimento fora do limite, não corresponde ao pattern, não está no enum, expressão custom avaliou `false`). O campo `rule` na entrada identifica qual regra falhou; `field`, qual campo. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-15.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `core/validation/`.
- Runtime consome registry hidratado — `ValidationEngine` só usa `registry.has()`/`registry.resolve()` sobre o `IRegistry` já populado por M04/M06 (bucket CRB `validation`, já existente e usado sem modificação).
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código do novo módulo.

## Débitos técnicos controlados

- **Conjunto inicial de regras:** `required`, `type`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `enum`, `custom` — o mínimo especificado para este slice. Regras adicionais (ex.: `unique` contra backend, `crossField` comparando dois campos do mesmo record) ficam para slices futuros, se necessário.
- **Integração futura com Execution Engine:** `M16 Execution Engine` (C.11) é o consumidor natural de `ValidationResult` como estágio 1 (Validate) do pipeline UP-09 — essa integração não existe ainda, propositalmente, pois M16 não foi criado neste slice.
- **Integração visual de mensagens fica para render/UI futuro:** `ValidationResult.errors[].message` já é uma string pronta para exibição, mas nenhuma integração com `M12 RenderEngine` foi feita neste slice (fora de escopo).
- **`validateAsync` é hoje um wrap síncrono:** não existe ainda nenhuma fonte de regra genuinamente assíncrona (ex.: verificação de unicidade contra o backend) neste nível do runtime — `validateAsync` existe para conformidade de interface e para permitir, no futuro, compor regras assíncronas sem quebrar a API pública.
- **Otimização/cache futuro:** cada chamada reprocessa as regras do registry; para volumes muito altos de validações repetidas do mesmo recurso, cachear o array de regras já resolvido é uma otimização de baixo risco para slice futuro.

## Conclusão

O C.10 está apto para merge do ponto de vista de qualidade: modelo de falha de duas camadas claro e consistente (regra malformada = erro estrutural lançado; dado inválido = entrada determinística em `errors[]`), sandbox real via delegação ao Expression Engine, determinístico, sem efeitos colaterais, sem execução automática de Action/Workflow/Render, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, com regressão completa (G423-01–14 + G423-20) verde.
