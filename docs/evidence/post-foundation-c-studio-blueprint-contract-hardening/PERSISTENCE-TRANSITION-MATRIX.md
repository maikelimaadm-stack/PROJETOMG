# PERSISTENCE TRANSITION MATRIX

`createStudioPersistenceTransitionMatrix()` — 17 cenários; `allMatched: true`.

## Transições permitidas (com gate/approval)

noPersistence→memoryOnly · memoryOnly→localReadOnly · localReadOnly→localWriteDraft
(gate) · localReadOnly→stagingReadOnly (audit) · stagingReadOnly→stagingWriteControlled
(flag+rollback) · stagingWriteControlled→productionRead (approval) ·
productionRead→productionWriteControlled (política explícita de escrita em produção).

## Bloqueadas

noPersistence/memoryOnly/localReadOnly → productionWriteControlled · migration/prisma/
backend automáticos · mutation default · dados reais como fixture · seed produtivo ·
schema automático.

## Resultado

`transitionAllowed`, `transitionBlocked`, `requiredGates`, `requiredApproval`,
`requiredEvidence`. Nenhuma transição executa migration/prisma/mutation.
