# Version Tuple Validation

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Tupla explicita (`validateSourceVersionTuple.js`)

A compatibilidade e verificada por uma **tupla explicita de versoes**, nao por um agregado.

- `handoffVersion`, `runtimeVersion`, `targetSandboxVersion` (e, quando aplicavel, versoes de contrato/plano/blueprint)
  sao comparadas por igualdade exata contra `DEFAULT_EXPECTED_VERSIONS`.
- Campo ausente => `BRIDGE_VERSION_MISSING`. Divergencia => codigo distinto por dimensao
  (`BRIDGE_HANDOFF_VERSION_MISMATCH`, `BRIDGE_SOURCE_RUNTIME_VERSION_MISMATCH`,
  `BRIDGE_TARGET_SANDBOX_VERSION_MISMATCH`).
- `upstreamVersions` agregado presente => bloqueador `BRIDGE_AGGREGATED_UPSTREAM_VERSIONS_FORBIDDEN`.

## Politica

`exactVersionMatchRequired: true`; downgrade proibido; upgrade **nao** e assumido compativel;
versao desconhecida falha fechado; verificacao bidirecional exigida.
