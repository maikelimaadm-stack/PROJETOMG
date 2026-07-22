# Manifest / Verifier / Compatibility

> **Post-Foundation C — Studio Bridge-to-Preview Sandbox Runtime Contract** - evidencia.
> CONTRATO headless (definicao apenas, sem consumer/runtime) entre o target descriptor da ponte endurecida e um
> futuro Preview Sandbox consumer runtime. Deterministico, imutavel, fail-closed, side-effect-free, dev-only.
> Subarvore: src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract/ (29 .js). Sem consumer,
> runtime, adapter, UI, App, mount, rota/menu, persistencia, backend/Prisma, modulo, certificacao, dados reais,
> produto ou Permission/Tenancy. Autorizado por PR #486 POST_MERGE_REVALIDATION_PASS_AND_BRIDGE_HARDENING_ENTERPRISE_PASS.

Manifest deterministico com partDigests + overallDigest sobre todas as partes. Verifier fail-closed detecta
fields/aliases/mappings inventados, versions/digests permissivos, source mutation, UI/App/mount, persistence/backend/
Prisma, real data, module/certification/product, SSOT inversion, prototype relink, manual gate ausente e runtime
prematuro. Compatibility: ready_for_enterprise_audit; readyForImplementationPlan/RuntimeImplementation/PreviewMount/
ProductExposure=false.