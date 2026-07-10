# QUALITY & SCALABILITY NOTES — FIRST REAL MODULE MIGRATION PLANNING

## Objetivo

Explicar a preparação para migração controlada de Empresas — uma camada de planejamento pura e passiva (readiness, risco, rollback, fases) que responde "Empresas está pronto e até onde?" sem migrar nada, sem dados reais, sem write e sem tocar backend/Prisma/UI real.

## Escalabilidade

- **Custo do readiness model:** O(1) — combina sinais passivos (booleans) e monta listas fixas; nenhuma IO.
- **Custo do risk model:** O(n) no número de riscos (10 base), sem IO.
- **Custo do rollback plan:** O(1) — dados estáticos declarativos.
- **Impacto no runtime quando não usado:** zero — são helpers puros exportados no barrel; nenhum efeito colateral no boot, nenhuma dependência de framework.
- **Impacto em dev quando usado:** apenas o custo de montar objetos planos pequenos (safeClone via JSON) — adequado para um painel/relatório dev ou um gate.

## Segurança / Fail-safe

- **Sem migração real:** `migratesThisSlice = false`; nenhuma fase é executada.
- **Sem dados reais:** nenhum import de `src/modules/*`; mock/sinais apenas.
- **Sem write:** nenhum caminho de escrita; `realWriteInScope = false`.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13).
- **Runtime legado preservado:** o plano exige legado como fonte da verdade e nunca o remove.
- **Rollback definido:** flag off, fallback legado, sem schema/write destrutivo.
- **Feature flags:** `MAK_RUNTIME_V2_EMPRESAS_READONLY` off por padrão para as fases futuras.
- **Prototype pollution bloqueada:** `validateProjectionInput` rejeita `__proto__`/`constructor`/`prototype`.
- **Dados sensíveis mascarados:** `redactSensitive` aplica `[REDACTED]` a chaves sensíveis nos sinais.

## Determinismo

- **Mesmo input gera o mesmo plano:** verificado por teste (`deepEqual`).
- **Sem side effects externos:** funções puras.
- **Outputs são cópias seguras:** `safeClone` — mutar o retorno não afeta chamadas futuras (verificado por teste).

## Riscos

10 riscos registrados, cada um com mitigação, gate e nota de rollback. Principais (severity high): divergência legado/v2 (RISK-01), drift de validação (RISK-02) e permissão (RISK-03), execução fora de hora (RISK-04), inconsistência de rollback (RISK-07), dependência oculta do legado (RISK-09). Mitigação transversal: runtime v2 permanece read-only e reversível por flag até paridade provada.

## Próximo passo recomendado

**Empresas Read-Only Runtime v2 Candidate** — condicionado a route activation/preview hub/controlled dataset/Empresas shadow/table-form shadow PASS, readiness ≥ read_only_candidate, rollback disponível e sem blockers críticos.

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não usa dados reais
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo

## Conclusão

O planejamento está **apto para merge**: camada pura, determinística, reversível e passiva, com readiness capado em `read_only_candidate`, risco/rollback definidos e recomendação de próximo slice estruturada — sem migração real, sem dados reais, sem write, sem dependência de Prisma/backend/MMM direto, sem dependência nova e sem CSS global novo.
