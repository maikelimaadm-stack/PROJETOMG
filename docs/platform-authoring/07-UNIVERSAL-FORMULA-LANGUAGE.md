# 07 — Universal Formula Language (UFL)

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-08

---

## Definition

**UFL** — declarative formula DSL for computed fields, widgets, validations. **No JavaScript. No SQL.**

---

## Syntax

```
expression := function | operator | literal | fieldRef
fieldRef   := FIELD('code') | RECORD.field | LOOKUP('bo', key)
```

---

## Operators

| Category | Operators |
|----------|-----------|
| Arithmetic | +, -, *, /, MOD |
| Comparison | =, <>, <, >, <=, >= |
| Logical | AND, OR, NOT |
| Text | CONCAT, LEFT, RIGHT, LEN, TRIM, UPPER, LOWER |
| Null | ISNULL, COALESCE |

---

## Functions (closed catalog)

| Function | Args | Returns |
|----------|------|---------|
| SUM | fieldRef | number |
| AVG | fieldRef | number |
| COUNT | fieldRef | number |
| MIN / MAX | fieldRef | number |
| CONCAT | strings... | string |
| IF | cond, then, else | any |
| LOOKUP | bo, keyField, returnField | any |
| TODAY / NOW | — | date/datetime |
| DATEADD | date, n, unit | date |
| DATEDIFF | d1, d2, unit | number |
| FORMAT | value, pattern | string |
| ROUND | n, decimals | number |

New functions: D-UA amendment + publish compile support.

---

## Context

| Context | Available refs |
|---------|----------------|
| Form | Current record fields |
| List aggregate | Selected rows |
| Dashboard widget | Query result columns |

---

## Compile

UFL → AST at publish → CRB V14 computed entries → Runtime evaluator (frozen engine G302).

---

*End of document.*
