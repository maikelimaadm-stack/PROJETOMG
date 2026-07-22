# Mapping Execution Plan (12 real mappings)

Source: bridge-to-preview-sandbox-runtime-contract/fieldMappingContract.js (FIELD_MAPPING_CONTRACT)

- m01: `candidateDraftId` → `candidateDraftId` (identity)
- m02: `candidateDraftRevision` → `candidateDraftRevision` (identity)
- m03: `candidateDraftDigest` → `candidateDraftDigest` (identity)
- m04: `sourceDigest` → `sourceDigest` (identity)
- m05: `sourceRuntimeVersion` → `sourceRuntimeVersion` (identity)
- m06: `sourceHandoffVersion` → `sourceHandoffVersion` (identity)
- m07: `sourceTargetSandboxVersion` → `sourceTargetSandboxVersion` (identity)
- m08: `synthetic` → `synthetic` (assert_true)
- m09: `immutable` → `immutable` (assert_true)
- m10: `validated` → `validated` (assert_true)
- m11: `targetContractVersion` → `sandboxContractVersion` (identity)
- m12: `syntheticPayload` → `previewMetadata` (envelope_metadata)

Transform allowlist: assert_true, envelope_metadata, identity
