# Allowlist fechada de stages de issue

`makeIssue(issueCode, stage, severity, path)` aceita apenas stages da allowlist FECHADA:

- os 23 stages canônicos de `PIPELINE_STAGES`;
- `config_normalization` (antes do pipeline começar);
- `public_boundary` (borda da API pública).

Total: 25. Não existe fallback por padrão: `made_up_stage`, `zzz`, `x_y_z`, `''`, valores não-string e os antigos nomes inventados (`resource_limit_enforcement`, `target_limit_enforcement`, `core_limit_enforcement`, `envelope_limit_enforcement`, `depth_limit_enforcement`, `issue_limit_enforcement`, `extension_validation`) colapsam deterministicamente para `unknown`.

Os enforcers de limite passaram a reportar nos stages canônicos correspondentes:

| Enforcer | Stage canônico |
|---|---|
| `enforceSourceResourceLimits` (bytes, strings) | `source_structure_normalization` |
| `enforceStructureDepth` | `source_structure_normalization` |
| `enforceSourceFieldCountLimit` | `source_decision_shape_validation` |
| `validateNoForbiddenExtensions` | `source_decision_shape_validation` |
| `enforceTargetDescriptorLimits` | `source_target_descriptor_validation` |
| `enforceCoreResourceLimits` | `core_completeness_validation` |
| `enforceEnvelopeResourceLimits` | `core_envelope_shape_validation` |
| `normalizeIssuesWithOverflow` | `public_boundary` |

`normalizeIssues()` lê apenas `issueCode` — o alias `code` foi removido. Uma entrada sem `issueCode` válido colapsa fail-closed para `BUILDER_CONFIG_INVALID`.
