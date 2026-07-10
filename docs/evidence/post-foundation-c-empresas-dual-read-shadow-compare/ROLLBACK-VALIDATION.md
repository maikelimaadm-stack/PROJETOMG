# ROLLBACK VALIDATION — EMPRESAS DUAL READ SHADOW COMPARE

## Estratégia de rollback

**Flag-off reversal.** O compare é opt-in por `MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE`. Desligar a flag retorna o compare a `skipped` (sem snapshots, sem side effects); o render legado é a única UI. Nenhuma mudança destrutiva, nenhuma mudança de schema, nenhum write real a desfazer.

## Flag off

- `MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE` default **off**.
- Com a flag off: `enabled: false`, `skipped: true`, `noSideEffects: true`, `legacySnapshot: null`, `runtimeV2Snapshot: null`.
- Em produção sem override: `productionBlocked: true` (fail-closed).

## Fallback para legado

- **Alvo:** tela legada de Empresas (inalterada por este slice).
- **Mecanismo:** o compare nunca substituiu a tela real; a UI real continua legada. Não há o que reverter na UI.
- **Fonte de dados:** runtime legado (inalterado). O compare usa apenas snapshots controlados (mock).

## Critérios de rollback

- divergência crítica/blocking detectada pelo compare
- erro de permissão
- erro de validação
- erro visual crítico
- falha de performance
- falha de build/lint/test
- qualquer gate protetor falho

## Comandos/gates para validar a reversão

```bash
npm run test:runtime:migration:empresas-dual-read
npm run gate:g423-empresas-dual-read
npm run gate:g423-empresas-readonly
npm run gate:g423
npm run test:runtime
npm run lint
npm run build
```

Com a flag off, os gates continuam verdes e a tela real permanece legada — confirmando um rollback limpo. O compare herda o rollback plan de `createEmpresasMigrationPlan()` (flag off, sem schema/write destrutivo).

## Riscos residuais

- compare deixado habilitado em ambiente não-prod (mitigado: dev-only + fail-closed em produção)
- diagnostics obsoletos em logs de dev (mitigado: limitados, não-sensíveis, mascarados)
- drift estrutural detectado como `blocked` sem resolução (mitigado: `nextAllowedStep` vira Drift Resolution, bloqueando avanço para UI)
