# Fuel Sandbox Components

Todos em `src/ModeloBase2/fuel-ui-sandbox/components/` (única pasta com React neste escopo).
Props-driven, sem libs novas, sem side effects reais, **sem rota/menu**.

| componente | responsabilidade | props |
|---|---|---|
| `ModeloBase2FuelSandboxShell` | Compõe título + cards + badges + form + table + timeline + diagnostics; dirige a sandbox session | `moduleId?`, `session?` |
| `ModeloBase2FuelEntryForm` | Formulário controlado local; `onSubmit(entry)` | `form`, `onSubmit`, `disabled?` |
| `ModeloBase2FuelEntriesTable` | Tabela de `viewModel.table`; `onRemove(entryId)` | `table`, `onRemove?` |
| `ModeloBase2FuelEventTimeline` | Timeline de eventos fuel | `timeline` |
| `ModeloBase2FuelDiagnosticsPanel` | Painel dev-only de diagnostics | `diagnostics` |
| `ModeloBase2FuelStatusBadges` | Badges (Local beta / Offline-first / Não sincronizado / sent:false / persistenceReal:false) | `badges` |

## Restrições

- Não alterar CSS global — usam classes locais `mb2-fuel-*`.
- Não importar libs novas; não chamar backend/fetch/Prisma/runtimeBridge; sem storage obrigatório.
- Não montar automaticamente em rota; não alterar App.jsx/menu.
- React (`useState`/`useMemo`) apenas nestes componentes; a lógica pura da sandbox é React-free.

## Sem rota/menu

Nenhum componente registra rota/menu nem é importado por `App.jsx`. O `build` compila os `.jsx`
mas, como nada os referencia a partir do entrypoint, eles não entram no bundle da aplicação.
