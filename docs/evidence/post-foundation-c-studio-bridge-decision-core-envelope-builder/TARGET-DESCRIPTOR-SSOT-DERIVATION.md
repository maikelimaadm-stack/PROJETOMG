# Target descriptor — derivação SSOT

Todas as listas e valores do target descriptor são derivados READ-ONLY dos upstreams reais. Não existe array literal local.

| Constante local | Origem upstream |
|---|---|
| `TARGET_DESCRIPTOR_FIELDS` (23) | `REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS` |
| `TARGET_DESCRIPTOR_REQUIRED_FIELDS` (16) | `REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS` |
| `TARGET_DESCRIPTOR_SECURITY_FIELDS` (7) | `SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS` |
| `TARGET_DESCRIPTOR_VERSION_FIELDS` (4) | `VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS` |
| `TARGET_DESCRIPTOR_DIGEST_FIELDS` (2) | `DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS` |
| `TARGET_DESCRIPTOR_INVARIANTS` (12) | `REAL_TARGET_DESCRIPTOR_INVARIANTS` |
| `TARGET_DESCRIPTOR_TARGET_KIND` | `SOURCE_TARGET_SANDBOX_KIND` |
| `SOURCE_TARGET_CONTRACT_VERSION` | `SOURCE_TARGET_CONTRACT_VERSION` |
| `AUTHORING_RUNTIME_VERSION_REF` | `SOURCE_AUTHORING_RUNTIME_VERSION` |
| `PREVIEW_SANDBOX_CONTRACT_VERSION_REF` | `SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION` |
| `SOURCE_HANDOFF_KIND_REF` | `SOURCE_HANDOFF_KIND` (bridge) |
| `SOURCE_HANDOFF_VERSION_REF` | `SOURCE_HANDOFF_VERSION` (bridge) |

`TARGET_DESCRIPTOR_REQUIRED_STRING_FIELDS` (10) também é DERIVADO: required menos os campos cujo invariante upstream é booleano, menos `candidateDraftRevision` e `syntheticPayload`.

## Exceção documentada

`targetDescriptor.kind = 'bridge-target-preview-sandbox-descriptor'` NÃO possui constante upstream que a exporte (o runtime contract exporta `FUTURE_SANDBOX_DESCRIPTOR_KIND` / `SANDBOX_DESCRIPTOR_CONTRACT.kind`, valores diferentes). É portanto uma REFERÊNCIA LOCAL documentada em `TARGET_DESCRIPTOR_KIND_LOCAL_REFERENCE_EXCEPTION` (`derivedFromUpstreamConstant:false`), provada contra uma bridge decision REAL no teste e no gate.

## Tupla de versão exata

`targetContractVersion`, `sourceRuntimeVersion`, `sourceHandoffVersion`, `sourceTargetSandboxVersion` são comparados por IGUALDADE contra as constantes upstream. Um valor semver-válido porém semanticamente errado (`fake-runtime@9.9.9`) é rejeitado no stage 6, antes de qualquer stage de digest. `sourceHandoffKind` idem.
