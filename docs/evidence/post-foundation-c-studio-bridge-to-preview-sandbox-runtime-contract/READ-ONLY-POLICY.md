# Read-Only Consumption Policy

> **Post-Foundation C — Studio Bridge-to-Preview Sandbox Runtime Contract** - evidencia.
> CONTRATO headless (definicao apenas, sem consumer/runtime) entre o target descriptor da ponte endurecida e um
> futuro Preview Sandbox consumer runtime. Deterministico, imutavel, fail-closed, side-effect-free, dev-only.
> Subarvore: src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract/ (29 .js). Sem consumer,
> runtime, adapter, UI, App, mount, rota/menu, persistencia, backend/Prisma, modulo, certificacao, dados reais,
> produto ou Permission/Tenancy. Autorizado por PR #486 POST_MERGE_REVALIDATION_PASS_AND_BRIDGE_HARDENING_ENTERPRISE_PASS.

sourceMutationAllowed=false; read_only; sem ownership transfer; sem retencao de referencia; clone + deep-freeze
exigidos; sem shared mutable state. Consumer futuro pode validar/mapear/criar candidato metadata-only, mas nunca
mount/React/persistencia/dados reais/rota/menu/modulo/certify/publish/produto.