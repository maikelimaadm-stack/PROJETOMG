# Adversarial Matrix

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Matriz coberta por teste vivo (todos `assert.doesNotThrow` + `bridge_rejected` + sem leak):
ciclo direto/indireto/array/aninhado/mutuo; profundidade limite-1/limite/limite+1 e 200000; undefined/function/
symbol/bigint; NaN/Infinity/-Infinity/-0; Date/RegExp/Map/Set/Error/Promise/typed array/ArrayBuffer/instancia de
classe; array esparso (indice/delete/length); getter/setter; Proxy get/ownKeys/getOwnPropertyDescriptor/has que
lancam; `__proto__`/`constructor`/`prototype`; config hostil (getter/Proxy/ciclo).
