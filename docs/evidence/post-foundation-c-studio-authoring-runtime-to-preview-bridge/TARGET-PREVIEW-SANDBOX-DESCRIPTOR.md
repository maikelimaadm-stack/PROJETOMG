# Target Preview Sandbox Descriptor

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Saida

`createTargetPreviewSandboxDescriptor.js` monta um descritor `module_preview_sandbox_candidate`
**apenas com metadados**, deep-frozen, a partir dos campos mapeados.

- 12 campos-alvo declarados (`TARGET_DESCRIPTOR_TARGET_FIELDS`).
- Nenhum preview e montado; nenhuma rota/menu criada; nenhum dado real anexado; nada exposto ao produto.
- `validateTargetDescriptor.js` reverifica a forma e as invariantes de seguranca do alvo antes de liberar.

## Atomicidade

O descritor so e criado quando **todos** os 13 estagios passam. Em qualquer bloqueador,
`targetDescriptor = null` — nunca um alvo parcial ou "meio montado".
