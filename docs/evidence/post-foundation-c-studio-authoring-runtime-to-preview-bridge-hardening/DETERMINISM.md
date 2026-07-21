# Determinism

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Mesma entrada invalida -> mesma decisao/issues/ordem/digest, em multiplas execucoes e instancias distintas
(deep-equal + digest-equal). Sem `Date`/`Math.random`/`randomUUID`/`performance.now`/`localeCompare`/`process.env`
na subarvore (fora do regex detector do verifier). Issues ordenadas deterministicamente.
