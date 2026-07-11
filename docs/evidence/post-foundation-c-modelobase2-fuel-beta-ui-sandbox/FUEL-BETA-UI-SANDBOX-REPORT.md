# Fuel Beta UI Sandbox Report

## Objetivo

Criar uma sandbox visual **beta** para o lançamento de combustível sobre o fuel headless candidate
— dev-only, isolada, **não montada** no app principal.

## O que foi criado

- **View model** presentacional (`createModeloBase2FuelUiViewModel`) derivado do fuel-headless.
- **Sandbox session** (`createModeloBase2FuelSandboxSession`) que dirige o ciclo via actions.
- **Actions** (`createModeloBase2FuelSandboxActions`) mapeando UI actions → comandos headless.
- **Diagnostics** com `uiMountedInApp/routeRegistered/menuRegistered = false`.
- **6 componentes React** (`components/*.jsx`): Shell, EntryForm, EntriesTable, EventTimeline,
  DiagnosticsPanel, StatusBadges — props-driven, sem libs novas, sem side effects reais.

## Por que ainda não é módulo real

- Não é montada no app; não registra rota nem menu.
- Não toca `src/modules`/`src/pages`; não usa backend/Prisma/fetch/runtimeBridge.
- Sem persistência real; eventos nunca enviados (`sent:false`).
- É uma **preview beta** do que uma futura tela de combustível poderia ser.

## Limitações

- Componentes presentacionais; sem integração real de browser garantida nos testes (source-scan).
- CSS via classes locais/utilitárias (`mb2-fuel-*`); sem alterar CSS global.
- Design ainda não representa a UI final.

## Próximo passo recomendado

**ModeloBase2 Fuel Dev Preview Route** ou **Fuel Module Shell Readiness** — **não** backend write.
