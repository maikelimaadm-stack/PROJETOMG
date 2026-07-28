# Public API (corrected — no bypass)

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0`.

A API pública é **somente**:

```
createBridgeDecisionCoreEnvelopeBuilder(config) -> { build(bridgeDecision) }
```

- `Object.keys(factory())` === `['build']` (provado em teste e gate); instância deep-frozen.
- O `index.js` **não** exporta execução parcial: `extractBridgeDecisionCore`, `recomputeBridgeDecisionDigest`,
  `constructCoreEnvelope`, `createBuilderDecision`, `createBuilderRejection`, `createEmergencyBuilderRejection`,
  normalizers, validators e enforcers são **internos**.
- Mantidos como read-only: constantes/versão (`builderConfig`), `verifyBuilderCompatibility`, `createBuilderReadiness`,
  `createBuilderManifest`, `createBuilderDiagnostics`, `REPLAY_IDEMPOTENCY`, `coreAllowlistIsSourceMinusDigest`.
- Testes unitários importam módulos internos diretamente por caminho.
- Síncrono; sem Promise/I/O/clock/random/estado global; cada instância isolada.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
