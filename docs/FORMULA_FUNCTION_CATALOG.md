# Formula Function Catalog — MAK Gestão

Catálogo oficial de funções suportadas pela **Formula Configuration Engine** (V17).

---

## Metadata suportada

| Chave | Descrição |
|-------|-----------|
| `formula` | Definição principal |
| `expression` | Expressão string ou objeto `{ fn, args }` |
| `dependsOn` / `watch` | Campos observados |
| `compute` / `calculate` | Alias de expressão |
| `persist` | Persistir valor calculado |
| `readOnly` | Campo somente leitura |

---

## Funções matemáticas

| Função | Args | Exemplo metadata |
|--------|------|------------------|
| `sum` | valores... | `{ fn: "sum", args: ["a", "b", "c"] }` |
| `avg` | valores... | `{ fn: "avg", args: ["a", "b"] }` |
| `min` | valores... | `{ fn: "min", args: ["a", "b"] }` |
| `max` | valores... | `{ fn: "max", args: ["a", "b"] }` |
| `count` | valores... | `{ fn: "count", args: ["a", "b"] }` |
| `multiply` | a, b | `{ fn: "multiply", args: ["preco", "qtd"] }` |
| `add` | a, b... | `{ fn: "add", args: ["a", "b"] }` |
| `subtract` | a, b | `{ fn: "subtract", args: ["total", "desconto"] }` |
| `divide` | a, b | `{ fn: "divide", args: ["parte", "whole"] }` |
| `round` | n, [decimals] | `{ fn: "round", args: ["valor", 2] }` |
| `ceil` | n | `{ fn: "ceil", args: ["valor"] }` |
| `floor` | n | `{ fn: "floor", args: ["valor"] }` |
| `abs` | n | `{ fn: "abs", args: ["valor"] }` |
| `percent` | parte, whole | `{ fn: "percent", args: ["parte", "whole"] }` |

### Expressão string (RPN infix)

```json
{
  "formula": {
    "dependsOn": ["frm_valor_a", "frm_valor_b"],
    "expression": "frm_valor_a + frm_valor_b"
  }
}
```

---

## Funções texto

| Função | Exemplo |
|--------|---------|
| `concat` | `{ fn: "concat", args: ["nome", " ", "sobrenome"] }` |
| `uppercase` | `{ fn: "uppercase", args: ["nome"] }` |
| `lowercase` | `{ fn: "lowercase", args: ["nome"] }` |
| `trim` | `{ fn: "trim", args: ["texto"] }` |
| `replace` | `{ fn: "replace", args: ["texto", "old", "new"] }` |
| `substring` | `{ fn: "substring", args: ["texto", 0, 5] }` |
| `coalesce` | `{ fn: "coalesce", args: ["a", "b", "default"] }` |
| `nullIf` | `{ fn: "nullIf", args: ["a", "b"] }` |
| `cast` | `{ fn: "cast", args: ["valor", "number"] }` |

---

## Funções condicionais

```json
{
  "formula": {
    "dependsOn": ["total", "desconto"],
    "expression": {
      "fn": "if",
      "args": [
        { "fn": "max", "args": ["desconto", 0] },
        { "fn": "subtract", "args": ["total", "desconto"] },
        "total"
      ]
    }
  }
}
```

`case`: `{ fn: "case", args: [cond1, val1, cond2, val2, default] }`

---

## Funções data/hora

| Função | Exemplo |
|--------|---------|
| `today` | `{ fn: "today", args: [] }` |
| `now` | `{ fn: "now", args: [] }` |
| `dateDiff` | `{ fn: "dateDiff", args: ["inicio", "fim", "days"] }` |
| `dateAdd` | `{ fn: "dateAdd", args: ["inicio", 7, "days"] }` |

---

## Exemplos reais (formulacert)

| Campo | Tipo | Metadata |
|-------|------|----------|
| `frm_total` | Total | `multiply(preco, quantidade)` |
| `frm_percentual` | Percentual | `percent(parte, whole)` |
| `frm_dias` | Data diff | `dateDiff(inicio, fim, days)` |
| `frm_nome_completo` | Concat | `concat(uppercase(nome), " ", uppercase(sobrenome))` |
| `frm_valor_final` | Condicional | `if(desconto > 0, total - desconto, total)` |
| `frm_soma` | String math | `frm_valor_a + frm_valor_b` |

Referência completa: `src/framework/mak/formula/formulaCertificationCatalog.js`

---

## Integração

```javascript
import { runMakFormulaEvaluation } from "@/framework/mak/formula";

const result = runMakFormulaEvaluation({
  formData,
  fieldDefinitions,
});
// result.values → patch de campos calculados
```

Hook React: `useMakFormFormulaEvaluation({ formData, setFormData, fieldDefinitions })`
