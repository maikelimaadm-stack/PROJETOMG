# Future Engine Slices

Ordem recomendada (todos contract-only / headless até um slice de ativação explícito):

1. **STUDIO BLUEPRINT → MODULE REFERENCE PLANNER** (contract-only) — mapeia um blueprint
   pronto para um plano de referência de módulo (sem gerar código).
2. **STUDIO BLUEPRINT ENGINE — VERSIONING SLICE** (contract-only) — política de
   versionamento semântico a partir da classificação de compatibilidade (breaking →
   major, backward_compatible → minor).
3. **STUDIO BLUEPRINT ENGINE — PERSISTENCE READINESS SLICE** (documental) — mapa de
   readiness de persistência, ainda reference-only, migration diferida.
4. **STUDIO BLUEPRINT ENGINE — GENERATION DRY-RUN SLICE** (headless) — dry-run de geração
   descrevendo o que seria gerado, sem escrever nenhum arquivo de módulo.

Nenhum destes autoriza produção, backend, Prisma, migration, UI, menu, rota ou rewrite
de Empresas sem um prompt específico e dedicado.
