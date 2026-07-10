# QUALITY & SCALABILITY NOTES — EMPRESAS READ UI RUNTIME BRIDGE DRY RUN

## Objetivo

Explicar o dry run da ponte entre read UI runtime v2 e bridge legado para Empresas — uma camada passiva e dev-only que simula um contrato de leitura e uma montagem teórica, sem executar efeito real, sem montar nada na tela real e sem tocar o runtimeBridge/makBootstrap de produção.

## Escalabilidade

- **Custo de criação do dry run model:** compõe o hardening model (→ toda a cadeia read-only) uma vez — linear no número de campos/colunas/linhas, em memória, sem IO.
- **Custo do bridge contract:** O(1) — dados declarativos estáticos.
- **Custo da mount simulation:** O(preconditions) — algumas checagens booleanas.
- **Custo dos diagnostics:** O(1) — combina flags e status.
- **Impacto com a flag DESLIGADA:** ~zero — model `skipped`; contrato/simulação nulos; painel renderiza um fallback pequeno; produção fail-closed.
- **Impacto em dev com a flag LIGADA:** o custo de compor a cadeia uma vez + montar objetos planos pequenos — adequado a um painel dev.

## Segurança / Fail-safe

- **Sem migração real:** o dry run é análise/simulação passiva.
- **Sem montagem real:** `mountedAnythingReal:false`; App.jsx/tela real/runtimeBridge intocados.
- **Sem dados reais como fonte principal:** inspeciona o controlled dataset (mock, mascarado).
- **Sem write:** write guard herdado — 11 operações bloqueadas; o contrato bloqueia 14 operações (write/legacy/backend/storage).
- **Bridge contract read-only:** allowed só leitura; `writeImpossible:true`.
- **Dry run opt-in:** off por padrão, fail-closed em produção.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13).
- **Runtime legado + runtimeBridge real preservados:** nenhum import de makBootstrap/runtimeBridge legado; a UI real continua legada.
- **Rollback por flag:** flag off restaura tudo; sem schema/write a desfazer.
- **Feature flags:** dry run flag (+ `_ALLOW_PROD`) + respeita a matriz de flags da cadeia.
- **Prototype pollution bloqueada** (no entrypoint) **; dados sensíveis mascarados.**

## Determinismo

- **Mesmo input gera o mesmo dry run model:** verificado por teste (`deepEqual`).
- **Contrato estável; simulação estável** (`simulationId` fixo — função pura das entradas).
- **Sem side effects externos:** funções puras/passivas.
- **Outputs são cópias seguras:** `safeClone`; o write guard vivo é re-anexado após o clone (stateless).

## Riscos

- precondition não satisfeita → `safeToProceed:false` (mitigado: reportado em blockedReasons; nextAllowedStep vira Dry Run Fixes)
- exposição acidental de dados (mitigado: mock + máscara + dev-only + fail-closed)
- confusão entre dry run e montagem real (mitigado: `mountedAnythingReal:false`, `dryRun:true`, gate valida que monta nada)
- rollback inconsistente (mitigado: flag off, sem schema/write)

## Próximo passo recomendado

- **Empresas Runtime Bridge Read Slot Candidate** se `readinessStatus = ready_for_next_slice` e `safeToProceed = true`.
- **Empresas Runtime Bridge Dry Run Fixes** se houver critical/blocking failures.

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não monta slot real
- ainda não usa dados reais como fonte principal
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo

## Conclusão

O runtime bridge dry run está **apto para merge**: camada read-only pura, determinística, reversível e passiva, com flag off por padrão, write impossível (guard ativo + contrato bloqueando 14 operações), contrato read-only e simulação de montagem que monta nada de verdade, diagnostics e rollback definidos — sem migração real, sem montagem real, sem dados reais como fonte, sem write, sem dependência de Prisma/backend/MMM direto, sem alterar o runtimeBridge/makBootstrap real, sem dependência nova, sem CSS global novo, e sem React exportado pelo barrel do runtime. `bridgeReady: true`, `readinessStatus: ready_for_next_slice`.
