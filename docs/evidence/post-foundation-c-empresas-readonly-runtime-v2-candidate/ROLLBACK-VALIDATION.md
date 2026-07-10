# ROLLBACK VALIDATION — EMPRESAS READ-ONLY RUNTIME V2 CANDIDATE

## Estratégia de rollback

**Flag-off reversal.** O candidate é opt-in por `MAK_RUNTIME_V2_EMPRESAS_READONLY`. Desligar a flag retorna o candidate a `skipped` sem estado residual; o render legado é a única UI. Nenhuma mudança destrutiva, nenhuma mudança de schema, nenhum write real a desfazer.

## Flag off

- `MAK_RUNTIME_V2_EMPRESAS_READONLY` default **off**.
- Com a flag off: `enabled: false`, `skipped: true`, `noSideEffects: true`, `viewModel: null`.
- Em produção sem override: `productionBlocked: true` (fail-closed).

## Fallback para legado

- **Alvo:** tela legada de Empresas (inalterada por este slice).
- **Mecanismo:** o candidate nunca substituiu a tela real; a UI real continua controlada pelo runtime legado. Não há o que reverter na UI.
- **Fonte de dados:** runtime legado (inalterado). O candidate usa apenas dataset controlado (mock).

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
npm run test:runtime:migration:empresas-readonly
npm run gate:g423-empresas-readonly
npm run gate:g423-migration-first-module
npm run gate:g423
npm run test:runtime
npm run lint
npm run build
```

Com a flag off, os gates continuam verdes e a tela real permanece legada — confirmando um rollback limpo. O candidate herda o rollback plan de `createEmpresasMigrationPlan()` (flag off, sem schema/write destrutivo).

## Riscos residuais

- candidate deixado habilitado em ambiente não-prod (mitigado: dev-only + fail-closed em produção)
- diagnostics obsoletos em logs de dev (mitigado: limitados, não-sensíveis, mascarados)
- divergência estrutural detectada só na fase de Dual Read (mitigado: o próximo slice compara outputs antes de qualquer exposição visual)
