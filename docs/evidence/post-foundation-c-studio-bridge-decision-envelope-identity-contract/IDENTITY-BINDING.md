# Identity Binding

> **Post-Foundation C — Studio Bridge Decision Envelope Identity Contract** - evidencia.
> CONTRATO headless (definicao apenas, sem runtime) que liga o bridgeDecisionDigest REAL ao seu targetDescriptor
> correspondente como envelope {bridgeDecisionDigest, targetDescriptor}. Deterministico, imutavel, fail-closed,
> side-effect-free, dev-only. Subarvore: bridge-decision-envelope-identity-contract/ (29 .js). Sem envelope builder,
> consumer runtime, implementation plan, mount, UI, App, rota/menu, persistencia, backend/Prisma, modulo,
> certificacao, dados reais ou produto. Autorizado por PR #487 READY_FOR_BRIDGE_DECISION_ENVELOPE_IDENTITY_CONTRACT.

bridgeDecisionDigest + targetDescriptor devem vir da MESMA decisao (digestAndDescriptorMustComeFromSameDecision). Verificacao
= recompute_and_compare antes da consumacao. Sem synthesis/alias/fallback. Clone + deep-freeze do descriptor exigidos; sem retencao
de referencia. identityVerificationImplemented=false (contrato apenas).