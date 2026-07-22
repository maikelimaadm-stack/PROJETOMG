# B-IDENTITY Root Cause

> **Post-Foundation C — Studio Bridge Decision Envelope Identity Contract** - evidencia.
> CONTRATO headless (definicao apenas, sem runtime) que liga o bridgeDecisionDigest REAL ao seu targetDescriptor
> correspondente como envelope {bridgeDecisionDigest, targetDescriptor}. Deterministico, imutavel, fail-closed,
> side-effect-free, dev-only. Subarvore: bridge-decision-envelope-identity-contract/ (29 .js). Sem envelope builder,
> consumer runtime, implementation plan, mount, UI, App, rota/menu, persistencia, backend/Prisma, modulo,
> certificacao, dados reais ou produto. Autorizado por PR #487 READY_FOR_BRIDGE_DECISION_ENVELOPE_IDENTITY_CONTRACT.

B-IDENTITY (auditoria da PR #487): o futuro consumer precisa do bridgeDecisionDigest, que NAO esta no targetDescriptor
(esta na bridgeDecision). Prova viva: o digest e FNV-1a sobre o core da decisao, que INCLUI o targetDescriptor completo
(alterar o descriptor muda o digest). Logo o envelope {bridgeDecisionDigest, targetDescriptor} pode ligar proveniencia via
recompute-and-compare. B-IDENTITY: CLOSED BY CONTRACT (bIdentityClosedByContract=true; bIdentityRemainsOpen=false).
readyForImplementationPlan permanece false — o proximo passo e o implementation plan, nao este slice.