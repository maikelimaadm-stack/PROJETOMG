# Next Steps

## Impacto na PR #462 (Preview Sandbox)

Depois que esta PR de governança mergear na main:
- A PR #462 deve ser **rebaseada** novamente sobre a main.
- O falso bloqueio branch-relative de escopo (S16 do engine test e gates standalone dos
  slices anteriores que foram migrados) fica **resolvido**, pois passam a tolerar os
  artifacts known-later do Preview Sandbox.
- Nenhum outro bloqueio conhecido permanece para a #462 além da governança de escopo.

## Adoção incremental

Gates standalone remanescentes de slices anteriores que ainda não consomem o helper podem
migrar incrementalmente, importando `isKnownLaterStudioHeadlessArtifact` e filtrando o
`outside`. Nenhuma mudança de assert funcional é necessária.

## Slices Studio headless futuros

Ao criar um slice headless futuro, registrar seus 4 paths (subtree/test/gate/evidence) em
`KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS` — ponto único e auditável — em vez de ampliar
allowlists espalhadas.

## Fora de escopo (continua proibido)

geração real de módulo · Combustível/Pesagem real · UI Studio produtiva · registry
produtivo · staging · production write · backend/Prisma/migration · mutation.
