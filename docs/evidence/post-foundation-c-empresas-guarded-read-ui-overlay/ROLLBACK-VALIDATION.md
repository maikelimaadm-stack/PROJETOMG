# ROLLBACK VALIDATION — EMPRESAS GUARDED READ UI OVERLAY

## Estratégia de rollback

**Flag-off reversal.** O overlay é opt-in por `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY`. Desligar a flag retorna o model a `skipped` (sem guarded read UI, sem side effects), e o container renderiza um fallback seguro dentro da rota dev preview. Nenhuma mudança destrutiva, nenhuma mudança de schema, nenhum write real a desfazer. A tela real de Empresas nunca foi tocada.

## Flag off

- `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY` default **off**.
- Com a flag off: `enabled: false`, `skipped: true`, `noSideEffects: true`, `guardedReadUi: null`; componente = fallback seguro.
- Em produção sem override: `productionBlocked: true` (fail-closed).
- A seção integrada na rota dev renderiza o fallback do overlay — a rota/hub continuam funcionando.

## Fallback para legado

- **Alvo:** tela legada de Empresas (inalterada por este slice).
- **Mecanismo:** o overlay é dev-only e nunca substituiu a tela real; a UI real continua legada. Não há o que reverter na UI real.
- **Fonte de dados:** runtime legado (inalterado). O overlay usa apenas controlled dataset (mock).

## Critérios de rollback

- divergência crítica/blocking detectada pelo dual-read compare
- erro de permissão
- erro de validação
- erro visual crítico
- falha de performance
- falha de build/lint/test
- qualquer gate protetor falho

## Comandos/gates para validar a reversão

```bash
npm run test:runtime:migration:empresas-guarded-read-ui-overlay
npm run gate:g423-empresas-guarded-read-ui-overlay
npm run gate:g423-empresas-guarded-read-ui
npm run gate:g423-empresas-dual-read
npm run gate:g423-preview-route
npm run gate:g423-preview-hub
npm run gate:g423
npm run test:runtime
npm run lint
npm run build
```

Com a flag off, os gates continuam verdes, a rota/hub dev continuam funcionando e a tela real permanece legada — confirmando um rollback limpo. O overlay herda o rollback plan de `createEmpresasMigrationPlan()` (flag off, sem schema/write destrutivo).

## Riscos residuais

- overlay deixado habilitado em ambiente não-prod (mitigado: dev-only + fail-closed em produção)
- diagnostics obsoletos em logs de dev (mitigado: limitados, não-sensíveis, mascarados)
- drift estrutural detectado como `blocked` sem resolução (mitigado: `nextAllowedStep` vira Drift Resolution, bloqueando avanço para parity hardening)
- integração na rota dev (mitigado: seção opt-in com fallback próprio; rota/hub gates verdes; App.jsx/menu intocados)
