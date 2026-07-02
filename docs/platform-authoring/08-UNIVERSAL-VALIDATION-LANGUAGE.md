# 08 — Universal Validation Language (UVL)

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-09

---

## Definition

**UVL** — declarative validation rules compiled to CRB V16.

---

## Rule types

| Type | Example |
|------|---------|
| Required | `REQUIRED(field)` |
| Range | `RANGE(qty, 1, 9999)` |
| Length | `LEN(name, 1, 200)` |
| Pattern | `MATCH(cnpj, REGEX_CNPJ)` |
| Conditional | `IF(tipo='PJ', REQUIRED(cnpj), TRUE)` |
| Cross-field | `COMPARE(startDate, <=, endDate)` |
| Unique | `UNIQUE(cpf, scope=tenant)` |
| Custom UFL | `UFLOK(expression)` |

---

## Messages

```yaml
rule: REQUIRED(cnpj)
message:
  pt-BR: "CNPJ é obrigatório"
  en-US: "Tax ID is required"
severity: error
```

| Severity | Behavior |
|----------|----------|
| error | Block save |
| warning | Allow save with confirm |

---

## Attachment levels

| Level | Scope |
|-------|-------|
| Field | Single field rules |
| BO | Record-level rules |
| Action | Precondition on action |
| Workflow step | Entry validation |

---

## Authoring

**Validation Designer** — visual rule builder emitting UVL strings stored in MMM validation objects.

---

*End of document.*
