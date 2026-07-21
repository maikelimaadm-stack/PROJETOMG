# Field Mapping Execution

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Fonte unica dos mapeamentos

`executeBridgeFieldMappings.js` consome `BRIDGE_FIELD_MAPPINGS` (12 mapeamentos) **do contrato** —
nao existe segunda lista divergente na ponte.

## Regras por mapeamento

- `sourceField` deve ser um campo real do handoff; `targetField` deve pertencer a
  `TARGET_DESCRIPTOR_TARGET_FIELDS` (12) — caso contrario, `INVENTED_SOURCE`/`INVENTED_TARGET`.
- Transformacoes permitidas: `identity`, `assert_true`, `clone_synthetic`.
- Sem duplicatas de origem/destino (`BRIDGE_MAPPING_DUPLICATE_FORBIDDEN`).
- Campo critico ausente => bloqueador; **nenhum default critico** e preenchido
  (`BRIDGE_MAPPING_CRITICAL_DEFAULT_FORBIDDEN`).
- `assert_true` exige valor `=== true` (`BRIDGE_MAPPING_ASSERT_TRUE_FAILED`).
- Clonagem lossless e deterministica via `normalizeBridgeInput`; a fonte nunca e mutada.

## Seguranca

Campos de seguranca sao **validados, nao copiados** — a ponte nao propaga flags perigosas para o alvo.
