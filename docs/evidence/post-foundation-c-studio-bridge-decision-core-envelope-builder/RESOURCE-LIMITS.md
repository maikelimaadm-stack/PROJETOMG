# Resource Limits (corrected — derived from the contract)

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0` — headless, dev-only, fail-closed.

**SSOT:** os limites são derivados ESTRITAMENTE de `RESOURCE_LIMITS_CONTRACT` + `RESOURCE_DIMENSION_NAMES`. Não existe tabela local divergente. Dimensão ausente, duplicada, desconhecida ou inválida **falha fechado**.

| dimensão | valor |
|---|---|
| maxSourceDecisionBytes | 524288 |
| maxSourceDecisionFields | 33 |
| maxCoreBytes | 262144 |
| maxCoreFields | 32 |
| maxTargetDescriptorFields | 23 |
| maxEnvelopeBytes | 524288 |
| maxIssues | 512 |
| maxStringLength | 4096 |
| maxStructureDepth | 64 |

- Bytes são **UTF-8 determinísticos**: `TextEncoder().encode(stableSerialize(value)).byteLength` — nunca `.length`.
- `maxStringLength` é aplicado **recursivamente** (valores e chaves); o hardcode `1048576` foi removido.
- `maxIssues` **não trunca silenciosamente**: overflow produz rejeição determinística `BUILDER_LIMIT_EXCEEDED`.
- `maxEnvelopeBytes` é validado **antes** da emissão do envelope.
- `maxEnvelopeFields` **não** substitui `maxEnvelopeBytes`.
- Provas `limit-1` / `limit` / `limit+1` para as nove dimensões (enforcer testado diretamente quando a shape validation
  bloqueia antes — precedência documentada: shape/eligibility precedem os enforcers no pipeline).

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
