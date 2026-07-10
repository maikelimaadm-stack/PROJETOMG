# ROLLBACK VALIDATION — EMPRESAS READ UI PARITY HARDENING

## Estratégia de rollback

**Flag-off reversal.** O hardening é opt-in por `MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING`. Desligar a flag retorna o model a `skipped` (checklist toda `skipped`, sem side effects), e o painel renderiza um fallback seguro. Nenhuma mudança destrutiva, nenhuma mudança de schema, nenhum write real a desfazer. A tela real de Empresas nunca foi tocada.

## Flag off

- `MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING` default **off**.
- Com a flag off: `enabled: false`, `skipped: true`, `noSideEffects: true`, `readinessStatus: skipped`; checklist toda `skipped`; painel = fallback seguro.
- Em produção sem override: `productionBlocked: true` (fail-closed).

## Fallback para legado

- **Alvo:** tela legada de Empresas (inalterada por este slice).
- **Mecanismo:** o hardening é dev-only e passivo; nunca substituiu a tela real. A UI real continua legada. Não há o que reverter na UI real.
- **Fonte de dados:** runtime legado (inalterado). O hardening apenas inspeciona o overlay (controlled dataset, mock).

## Critérios de rollback

- readinessStatus `blocked` ou `needs_hardening` sem resolução
- divergência crítica/blocking detectada
- erro de permissão/validação/visual crítico
- falha de performance
- falha de build/lint/test
- qualquer gate protetor falho

## Comandos/gates para validar a reversão

```bash
npm run test:runtime:migration:empresas-read-ui-parity-hardening
npm run gate:g423-empresas-read-ui-parity-hardening
npm run gate:g423-empresas-guarded-read-ui-overlay
npm run gate:g423-empresas-guarded-read-ui
npm run gate:g423-empresas-dual-read
npm run gate:g423
npm run test:runtime
npm run lint
npm run build
```

Com a flag off, os gates continuam verdes e a tela real permanece legada — confirmando um rollback limpo. O hardening herda o rollback plan de `createEmpresasMigrationPlan()` (flag off, sem schema/write destrutivo).

## Riscos residuais

- hardening deixado habilitado em ambiente não-prod (mitigado: dev-only + fail-closed em produção)
- diagnostics obsoletos em logs de dev (mitigado: limitados, não-sensíveis, mascarados)
- warning de row shape não resolvido (mitigado: não-bloqueante; `nextAllowedStep` permanece Dry Run enquanto não houver critical/blocking; a resolver em slice futuro)
