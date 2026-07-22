# Provenance

> **Post-Foundation C — Studio Bridge Decision Envelope Identity Contract** - evidencia.
> CONTRATO headless (definicao apenas, sem runtime) que liga o bridgeDecisionDigest REAL ao seu targetDescriptor
> correspondente como envelope {bridgeDecisionDigest, targetDescriptor}. Deterministico, imutavel, fail-closed,
> side-effect-free, dev-only. Subarvore: bridge-decision-envelope-identity-contract/ (29 .js). Sem envelope builder,
> consumer runtime, implementation plan, mount, UI, App, rota/menu, persistencia, backend/Prisma, modulo,
> certificacao, dados reais ou produto. Autorizado por PR #487 READY_FOR_BRIDGE_DECISION_ENVELOPE_IDENTITY_CONTRACT.

sourceDecisionOrigin=hardened_authoring_runtime_to_preview_bridge. Par atomico decision+descriptor exigido; cross-decision mixing,
descriptor/digest replacement proibidos. Issue codes: missing decision/digest/target, pair mismatch, digest tampered, cross-decision mix.