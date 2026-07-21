# Security & Safety

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Garantias (`createBridgeSecuritySafety.js`)

- **Fail-closed** em toda validacao: na duvida, bloqueia.
- Flags de seguranca do handoff sao **validadas, nao copiadas** para o alvo.
- `realDataAttached` verdadeiro => bloqueador (nenhum dado real jamais transita pela ponte).
- `previewMounted`/`routeCreated`/`menuCreated`/`productExposed` verdadeiros => bloqueadores.
- Sem `eval`, sem `Function`, sem rede, sem FS, sem `process` mutavel — varreduras estaticas no gate.

## Adulteracao

Adulteracao de digest, versao ou identidade e detectada e bloqueada deterministicamente
(recompute-and-compare + tupla explicita + identidade estrita).
