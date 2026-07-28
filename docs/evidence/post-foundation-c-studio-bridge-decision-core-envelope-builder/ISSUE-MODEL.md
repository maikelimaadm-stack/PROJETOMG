# Issue Model (corrected — exact contract shape)

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0`.

Shape EXATA exigida pelo contrato (10 campos, em ordem):

```
issueCode, severity, stage, path, message, deterministic,
blocksBuilder, blocksEnvelope, blocksRuntime, blocksPreviewSandbox
```

- `issueCode` sempre um dos 40 códigos reais (desconhecido colapsa determinísticamente).
- `path` sanitizado e relativo (caminho absoluto/hostil vira `''`); `message` derivada do código, nunca de exceção.
- `deterministic: true`; flags `blocks*` coerentes com a severidade.
- Ordenação e dedupe determinísticos por (issueCode, stage, path).
- Sem stack, cause, raw value, caminho absoluto ou secret.
- O modelo antigo `{code, stage, severity}` foi **substituído**; testes/gates/docs usam `issue.issueCode`.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
