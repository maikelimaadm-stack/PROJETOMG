# Safe Structural Clone

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


`normalizeBridgeInput.clone(value, depth, ancestors)`:
- WeakSet de ancestrais ativos -> referencia ciclica vira `null` (nunca recursao infinita).
- Depth-cap `MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH` -> alem do limite vira `null` (stack-safe).
- Descarta `function`/`symbol`/`undefined` e as chaves perigosas `__proto__`/`constructor`/`prototype`.
- Le descritores via `getOwnPropertyDescriptors` e **nunca** invoca getters/setters.
- Preserva ordem de arrays; numeros nao-finitos viram `null`. Nunca lanca, nunca muta a entrada.
`safeNormalizeSourceStructure` faz a validacao completa e retorna `{ok,value,issues}`; em bloqueio, `value=null`.
