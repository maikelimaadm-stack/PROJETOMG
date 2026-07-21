# Cycle Guard

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


WeakSet de ancestrais ativos no caminho de recursao. Ciclo direto (`s.self=s`), indireto (`a.b.a`), de array
(`arr.push(arr)`) ou aninhado -> issue `BRIDGE_SOURCE_STRUCTURE_CYCLE` (blocker), decisao `bridge_rejected`,
alvo nulo, sem lancar. Referencia compartilhada NAO-ciclica e permitida (clonada, sem reter alias mutavel).
