# ROLLBACK PLAN — EMPRESAS FIRST MODULE MIGRATION

Espelho legível de `createMigrationRollbackPlan()`. O rollback é **trivial por design**: cada fase planejada é reversível por uma única feature flag, com o runtime legado sempre permanecendo a fonte da verdade e sem nenhuma mudança destrutiva ou de schema para desfazer.

---

## Estratégia de rollback

**Flag-off reversal.** Desligar a feature flag do módulo restaura o render legado imediatamente, sem estado residual do runtime v2. Nenhuma migração destrutiva; nenhuma mudança de schema; nenhum write real do runtime v2 a reverter.

## Flags

- **Feature flag:** `MAK_RUNTIME_V2_EMPRESAS_READONLY`
- **Default:** `off`
- Cada fase é gated por flag; o rollback é simplesmente colocar a flag em `off`.

## Fallback para legado

- **Alvo:** tela legada de Empresas.
- **Mecanismo:** flag off restaura o render legado sem estado residual do runtime v2.
- **Fonte de dados:** runtime legado (inalterado).

## Garantias

- feature flag off por padrão
- runtime legado permanece a fonte principal da verdade
- nenhuma migração destrutiva
- nenhuma mudança de schema
- nenhum write real feito pelo runtime v2
- reversão é um único PR (revert de flag/branch)
- fallback para a tela legada sempre disponível
- diagnostics/logs retidos para análise post-mortem

## Critérios de rollback

- divergência crítica de dados entre legado e runtime v2
- erro de permissão
- erro de validação
- erro visual crítico
- falha de performance
- falha de build/lint/test
- qualquer gate protetor falho

## Comandos/gates para validar a reversão

```bash
npm run test:runtime:migration:first-module
npm run gate:g423-migration-first-module
npm run gate:g423
npm run test:runtime
npm run lint
npm run build
```

A reversão é validada re-rodando os gates do módulo com a flag off; uma suíte verde com render legado confirma um rollback limpo.

## Riscos residuais

- um preview deixado habilitado em ambiente não-prod (mitigado: dev-only + fail-closed em produção)
- diagnostics obsoletos acumulando em logs de dev (mitigado: limitados, não-sensíveis, dev-only)
