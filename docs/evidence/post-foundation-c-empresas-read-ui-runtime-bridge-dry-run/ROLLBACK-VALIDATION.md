# ROLLBACK VALIDATION — EMPRESAS READ UI RUNTIME BRIDGE DRY RUN

## Estratégia de rollback

**Flag-off reversal.** O dry run é opt-in por `MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN`. Desligar a flag retorna o model a `skipped` (sem contrato, sem simulação, sem side effects), e o painel renderiza um fallback seguro. Nenhuma mudança destrutiva, nenhuma mudança de schema, nenhum write real a desfazer. A tela real de Empresas e o runtimeBridge real nunca foram tocados.

## Flag off

- `MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN` default **off**.
- Com a flag off: `enabled: false`, `skipped: true`, `noSideEffects: true`, `bridgeContract: null`, `mountSimulation: null`, `bridgeReady: false`; painel = fallback seguro.
- Em produção sem override: `productionBlocked: true` (fail-closed).

## Fallback para legado

- **Alvo:** tela legada de Empresas (inalterada por este slice).
- **Mecanismo:** o dry run é passivo e nunca montou nada; a UI real continua legada e o runtimeBridge real intocado. Não há o que reverter.
- **Fonte de dados:** runtime legado (inalterado). O dry run apenas inspeciona a cadeia read-only (controlled dataset, mock).

## Critérios de rollback

- `bridgeReady = false` / `safeToProceed = false` sem resolução
- readinessStatus `needs_fixes`/`needs_hardening`
- divergência crítica/blocking detectada na cadeia
- erro de permissão/validação/visual crítico
- falha de performance
- falha de build/lint/test
- qualquer gate protetor falho

## Comandos/gates para validar a reversão

```bash
npm run test:runtime:migration:empresas-bridge-dry-run
npm run gate:g423-empresas-bridge-dry-run
npm run gate:g423-empresas-read-ui-parity-hardening
npm run gate:g423-empresas-guarded-read-ui-overlay
npm run gate:g423
npm run test:runtime
npm run lint
npm run build
```

Com a flag off, os gates continuam verdes, a tela real permanece legada e o runtimeBridge real intocado — confirmando um rollback limpo. O dry run herda o rollback plan de `createEmpresasMigrationPlan()` (flag off, sem schema/write destrutivo).

## Riscos residuais

- dry run deixado habilitado em ambiente não-prod (mitigado: dev-only + fail-closed em produção)
- diagnostics obsoletos em logs de dev (mitigado: limitados, não-sensíveis, mascarados)
- warning de row shape herdado do hardening (mitigado: não-bloqueante; `bridgeReady` só é true com readiness ready e sem blockers)
