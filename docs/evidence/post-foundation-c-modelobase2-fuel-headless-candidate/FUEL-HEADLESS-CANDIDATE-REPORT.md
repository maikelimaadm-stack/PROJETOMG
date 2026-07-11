# Fuel Headless Candidate Report

## Objetivo

Provar que o ModeloBase2 Operational Runtime serve um **domínio real** (combustível) permanecendo
**headless** — mapeando abastecimento para o ciclo command/event/draft/snapshot, sem UI/backend.

## Por que combustível foi escolhido

Conforme a auditoria (First Real Module Candidate Audit, 78/80): um abastecimento é um **append
natural** (1 registro = 1 entry), com shape mínimo/estável (data, máquina, litros, horímetro), sem
cálculo derivado nem device — ideal para provar o padrão headless antes de pesagem/apontamento.

## Adapter headless

`createModeloBase2FuelOperationalAdapter({ moduleId })` **possui** um operational runtime + session
e traduz comandos/eventos fuel ↔ operacionais. Expõe `dispatch(fuelCommand)`, `getReadState`,
`getState`, `getEventLog`, `getDiagnostics`, `createSnapshot`, `restoreSnapshot`, `reset`.

O candidate `createModeloBase2FuelHeadlessCandidate({ moduleId })` embrulha schema + adapter +
diagnostics + fallback + `supportedCommands`/`supportedEvents` + `limitations` + `nextSteps`.

## Relação com o ModeloBase2 Operational Runtime

- `createModeloBase2OperationalRuntime` / `createSession` — o ciclo local (session + state machine +
  event log + snapshot bridge).
- Comandos fuel → operacionais (via command mapper) e eventos operacionais → fuel (via event mapper).
- O runtime **não é alterado**; o fuel é uma **camada de domínio** por cima.

## Limitações

- Headless — sem UI/rota/menu/src-modules.
- Domínio mínimo (sem cálculo financeiro, estoque/tanque, device, sync).
- Local + memory-only (`persistenceReal:false`); eventos nunca enviados (`sent:false`).
- Não toca módulos reais, ModeloBase1, Empresas/cadcps, backend/Prisma/runtimeBridge.

## Próximo passo recomendado

**ModeloBase2 Fuel UI Readiness** ou **Fuel Beta UI Sandbox** — **não** backend write.
