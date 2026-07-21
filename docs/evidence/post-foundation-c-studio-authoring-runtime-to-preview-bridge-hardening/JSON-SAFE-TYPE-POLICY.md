# JSON-Safe Type Policy

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Permitidos: `null`, boolean, string, number finito, plain object (`Object.prototype` ou prototype nulo), array denso.
Fail-closed: `undefined`/function/symbol/bigint (`BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE`); NaN/Infinity/-Infinity
(`BRIDGE_SOURCE_NON_FINITE_NUMBER`); `-0` (`BRIDGE_SOURCE_NEGATIVE_ZERO_FORBIDDEN`); Date/RegExp/Map/Set/WeakMap/
WeakSet/ArrayBuffer/typed arrays/Promise/Error/instancia de classe/prototype customizado (`BRIDGE_SOURCE_NON_PLAIN_OBJECT`).
