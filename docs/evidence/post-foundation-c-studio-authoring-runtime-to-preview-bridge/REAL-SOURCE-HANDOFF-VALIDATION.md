# Real Source Handoff Validation

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Fonte da verdade

O formato do handoff e ditado por `module-blueprint-authoring-runtime/createSyntheticPreviewHandoff.js`
(20 campos, somente-leitura). A ponte **nao inventa** campos.

## Campos reais (20)

`kind`, `handoffKind`, `handoffVersion`, `runtimeVersion`, `targetSandboxVersion`, `draftId`,
`draftRevision`, `draftDigest`, `synthetic`, `immutable`, `validated`, `previewPayloadCreated`,
`previewMounted`, `realDataAttached`, `routeCreated`, `menuCreated`, `productExposed`, `payload`,
`ok`, `handoffDigest`.

## Validacao de forma (`validateSourceHandoffShape.js`)

- Todos os campos obrigatorios presentes e do tipo correto — fail-closed.
- **Nao** ha `upstreamVersions` agregado (alias legado proibido) nem campo generico `digest`.
- Flags de seguranca validadas (nao copiadas): `synthetic===true`, `immutable===true`, `validated===true`,
  `realDataAttached===false`, `previewMounted===false`, `routeCreated===false`, `menuCreated===false`,
  `productExposed===false` — qualquer violacao e bloqueadora (`validateSourceSecurityFlags`).
