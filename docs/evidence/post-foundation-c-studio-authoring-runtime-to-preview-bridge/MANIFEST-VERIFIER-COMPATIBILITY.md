# Manifest / Verifier / Compatibility

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Manifesto (`createBridgeManifest.js`)

Descreve identidade, versoes, capacidades (53: verdadeiras/falsas), estagios, mapeamentos e codigos de issue —
tudo deep-frozen.

## Verificador (`verifyAuthoringRuntimeToPreviewBridge.js`)

- `mustBeTrue` (capacidades exigidas) e `mustBeFalse` (capacidades proibidas) checadas exaustivamente.
- Retorna `{ ok }`; qualquer divergencia de capacidade => `ok=false`.
- Contem a regex de deteccao de nao-determinismo (excluida das varreduras para evitar auto-casamento).

## Compatibilidade (`checkAuthoringRuntimeToPreviewBridgeCompatibility.js`)

Status `headless_bridge_ready_for_enterprise_checkpoint` quando tupla de versoes e forma batem.
