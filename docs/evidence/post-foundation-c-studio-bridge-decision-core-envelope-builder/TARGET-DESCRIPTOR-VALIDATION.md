# Target Descriptor Validation (corrected — exact 23-field shape)

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0`.

Derivado READ-ONLY de `OUTPUT_TARGET_DESCRIPTOR_FIELDS` / `REAL_TARGET_DESCRIPTOR_FIELDS` (23 campos), com subconjuntos
derivados dos nomes reais: required, security, version e digest fields, além dos invariantes positivos.

Valida:
- **23 campos exatos**; required completos; **zero invented fields**
- `kind` = `bridge-target-preview-sandbox-descriptor`; `targetKind` = `module_preview_sandbox_candidate`
- `targetContractVersion` exata (= preview sandbox contract) + versões bem-formadas
- digests válidos (`fnv1a-` + 8 hex)
- `synthetic` / `metadataOnly` / `immutable` / `validated` = **true**
- security fields (`previewMounted`, `routeCreated`, `menuCreated`, `productExposed`, `realDataAttached`,
  `moduleGenerated`, `persistenceAllowed`) = **false**
- candidate identity válida (`candidateDraftRevision` inteiro ≥ 0)
- `syntheticPayload` plain object seguro
- sem accessors/prototypes/pollution; dentro de `maxTargetDescriptorFields` (23)

Tamper por classe (required, invented, invariant, version, digest, security, kind) coberto em teste e gate — não é
mais uma lista manual de sete flags.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
