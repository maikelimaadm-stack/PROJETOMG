# NEXT SLICE SPEC

## Recomendação

**POST-FOUNDATION C — STUDIO BLUEPRINT CONTRACT HARDENING**

Ainda **headless e contract-only**, sem UI/rota/menu/módulo/backend/Prisma/
migration/produção.

## Objetivo

Endurecer o Blueprint acima da fundação: validação profunda de um Blueprint
completo (Module + Fields + Screens + Validations + Permissions + Route/Menu +
Persistence + Runtime Binding), transições de estado do ciclo de vida, e um
"blueprint linter" que rejeita blueprints inseguros — tudo com fixtures
sintéticos.

## Escopo proposto

1. `validateStudioBlueprint(blueprint)` — valida um Blueprint completo contra os
   contratos desta fundação, retornando blockers/warnings determinísticos.
2. Máquina de transição de estados (`draft` → … → `certified_local`) fail-closed.
3. Blueprint fixtures sintéticos (cadastro e operacional) — nenhum dado real.
4. Digest + verifier do Blueprint endurecido, reutilizando o kernel desta fundação.
5. Compatibility checker estendido ao nível de Blueprint.

## Fora de escopo (continua proibido)

- Gerar módulo/UI/rota/menu.
- Backend, Prisma, migration, fetch, produção, staging, mutação.
- Nova dependência.
- Alterar SSOT em `docs/runtime-implementation/`.

## Motivo

A fundação estabelece o vocabulário e as garantias. O próximo passo natural é
**validar blueprints completos** contra esse vocabulário antes de qualquer
geração — mantendo a disciplina headless por mais um slice.
