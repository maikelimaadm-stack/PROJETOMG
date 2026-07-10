# ROLLBACK VALIDATION — EMPRESAS RUNTIME BRIDGE READ SLOT CANDIDATE

## Estratégia de rollback

**Flag-off reversal.** O candidate é opt-in por `MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE`. Desligar a flag retorna o model a `skipped` (sem contrato, payload, validação ou mount plan, sem side effects), e o painel renderiza um fallback seguro. Nenhuma mudança destrutiva, nenhuma mudança de schema, nenhum write real a desfazer. A tela real de Empresas e o runtimeBridge real nunca foram tocados.

## Flag off

- `MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE` default **off**.
- Com a flag off: `enabled: false`, `skipped: true`, `noSideEffects: true`, `readSlotContract: null`, `readSlotPayload: null`, `mountPlan: null`, `slotReady: false`; painel = fallback seguro.
- Em produção sem override: `productionBlocked: true` (fail-closed).

## Fallback para legado

- **Alvo:** tela legada de Empresas (inalterada por este slice).
- **Mecanismo:** o candidate é passivo e nunca montou nada; a UI real continua legada e o runtimeBridge real intocado. Não há o que reverter.
- **Fonte de dados:** runtime legado (inalterado). O candidate apenas inspeciona a cadeia read-only (controlled dataset, mock).

## Critérios de rollback

- `slotReady = false` / `safeToProceed = false` / `payloadValidation.valid = false` sem resolução
- readinessStatus `needs_fixes`/`needs_hardening`
- divergência crítica/blocking detectada na cadeia
- erro de permissão/validação/visual crítico
- falha de performance
- falha de build/lint/test
- qualquer gate protetor falho

## Comandos/gates para validar a reversão

```bash
npm run test:runtime:migration:empresas-read-slot
npm run gate:g423-empresas-read-slot
npm run gate:g423-empresas-bridge-dry-run
npm run gate:g423-empresas-read-ui-parity-hardening
npm run gate:g423
npm run test:runtime
npm run lint
npm run build
```

Com a flag off, os gates continuam verdes, a tela real permanece legada e o runtimeBridge real intocado — confirmando um rollback limpo. O candidate herda o rollback plan de `createEmpresasMigrationPlan()` (flag off, sem schema/write destrutivo).

## Riscos residuais

- candidate deixado habilitado em ambiente não-prod (mitigado: dev-only + fail-closed em produção)
- diagnostics obsoletos em logs de dev (mitigado: limitados, não-sensíveis, mascarados)
- warning de row shape herdado (mitigado: não-bloqueante; `slotReady` só é true com readiness ready, payload valid e sem blockers)
