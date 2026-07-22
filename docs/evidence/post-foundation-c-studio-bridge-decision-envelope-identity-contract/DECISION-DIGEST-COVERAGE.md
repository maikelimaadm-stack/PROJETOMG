# Decision Digest Coverage

> **Post-Foundation C — Studio Bridge Decision Envelope Identity Contract** - evidencia.
> CONTRATO headless (definicao apenas, sem runtime) que liga o bridgeDecisionDigest REAL ao seu targetDescriptor
> correspondente como envelope {bridgeDecisionDigest, targetDescriptor}. Deterministico, imutavel, fail-closed,
> side-effect-free, dev-only. Subarvore: bridge-decision-envelope-identity-contract/ (29 .js). Sem envelope builder,
> consumer runtime, implementation plan, mount, UI, App, rota/menu, persistencia, backend/Prisma, modulo,
> certificacao, dados reais ou produto. Autorizado por PR #487 READY_FOR_BRIDGE_DECISION_ENVELOPE_IDENTITY_CONTRACT.

bridgeDecisionDigest = createDeterministicDigest(core), core = decisao menos bridgeDecisionDigest. PROVA: recompute sobre
decision-minus-digest == bridgeDecisionDigest; alterar targetDescriptor/status/issues muda o digest. targetDescriptorCoveredByDigest=true;
issuesCoveredByDigest=true; statusCoveredByDigest=true; sourceIdentityCoveredByDigest=true. FNV internal-only; cryptographicIntegrityProvided=false.