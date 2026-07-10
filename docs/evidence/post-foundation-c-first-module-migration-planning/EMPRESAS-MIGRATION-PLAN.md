# EMPRESAS MIGRATION PLAN

Plano de migração controlada do módulo **Empresas** para runtime v2. Este documento é o espelho legível do model determinístico `createEmpresasMigrationPlan()`.

> **Este slice não executa nenhuma fase de migração. Apenas prepara o plano.**

---

## Estado atual

- O **runtime legado** controla a tela real de Empresas e é a **fonte da verdade**.
- O **runtime v2** observa via shadow pilot + table/form shadow projection.
- **Preview dev-only** disponível (`/__dev/runtime-v2/previews`), flag-protegido, fail-closed em produção.
- **Controlled dataset** disponível (mock, opt-in).
- **Nenhum dado real** é usado; nenhum write ocorre.

## Por que Empresas foi escolhido

Empresas é o módulo com a evidência de runtime v2 mais madura já na main: shadow pilot, table/form shadow, controlled preview, dev preview hub, controlled dataset e a rota dev-only — todos passando. Essa é exatamente a evidência que um read-only candidate precisa, tornando Empresas o primeiro passo de menor risco.

## Fases

### Fase 0 — Current State
- runtime legado controla a tela · runtime v2 observa via shadow · preview dev-only disponível · dataset controlado disponível · rota dev-only disponível · dados reais não usados.
- **write:** não · **reversível:** sim · **executada neste slice:** não.

### Fase 1 — Read-only Runtime v2 Candidate (próximo slice provável)
- runtime v2 pode gerar estrutura read-only · sem salvar/editar/excluir · sem substituir a UI real · comparação com legado · feature flag desligada por padrão.
- **write:** não · **reversível:** sim · **executada neste slice:** não.

### Fase 2 — Dual Read / Shadow Compare
- legado continua fonte da verdade · runtime v2 lê estrutura/dados controlados ou adaptados · compara outputs · sem write.
- **write:** não · **reversível:** sim · **executada neste slice:** não.

### Fase 3 — Guarded UI Slice
- pequena parte visual controlada pelo runtime v2 · ainda reversível · flag por módulo.
- **write:** não · **reversível:** sim · **executada neste slice:** não.

### Fase 4 — Controlled Write Candidate (fora de escopo)
- somente depois de gates e rollback provados.
- **write:** sim · **fora de escopo atual.**

### Fase 5 — Full Cutover Candidate (fora de escopo)
- **fora de escopo atual.**

## Critérios de avanço (para Fase 1)

O próximo slice só pode ser **Empresas Read-Only Runtime v2 Candidate** se e somente se:
- route activation PASS · preview hub PASS · controlled dataset PASS · Empresas shadow PASS · Empresas table/form shadow PASS · readiness status ≥ read_only_candidate · rollback available · nenhum blocker crítico.

## Critérios de bloqueio

- shadow/table-form shadow falhando · legado deixou de ser fonte da verdade · qualquer write real por runtime v2 · qualquer gate protetor falho.

## Dependências

- Shadow pipeline (Empresas + genérico) · preview hub · controlled dataset · rota dev-only + activation · gates G423 preview/route/shadow · master gate G423.

## Próximos gates

- `gate:g423-migration-first-module` (este slice) → depois `gate:g423` do read-only candidate slice, mantendo todos os gates de preview/route/shadow verdes.

## Próximos testes

- `test:runtime:migration:first-module` (este slice) → depois os testes read-only do próximo slice + `test:runtime` completo.

## O que está fora de escopo

- migrar a tela real de Empresas · usar dados reais · writes/edits/deletes reais · remover o runtime legado · mudanças em backend/Prisma · Studio/Marketplace · iniciar Foundation D/E.
