# Fuel Module Contract

`createModeloBase2FuelModuleContract({ moduleId })` — descritor plano/imutável do módulo futuro.

## moduleId / identidade

- **moduleId:** `modelobase2-fuel`
- **domain:** `fuel`
- **modelFamily:** `modeloBase2`
- **modelType:** `operacional`

## Metadata (mínima)

- **displayName:** `Combustível`
- **description:** módulo de lançamento e controle de combustível sobre o runtime operacional ModeloBase2
- **category:** `Operacional`
- **iconName:** `Fuel` (string apenas — sem import de ícone/logo/marca externa)
- **status:** `beta_shell_readiness`
- **version:** `0.1.0-shell-readiness`
- **owner:** `MAK Gestão`
- **riskLevel:** `controlled_beta`
- **routes / menu / permissions:** `planned: true`, `registered: false`
- **persistence:** `localOnly`, `persistenceReal: false`

## Commands

`createFuelDraft`, `appendFuelEntry`, `updateFuelEntry`, `removeFuelEntry`, `validateFuelDraft`,
`saveFuelDraft`, `submitFuelDraft`, `createFuelSnapshot`, `restoreFuelSnapshot`, `resetFuelDraft`

## Events

`fuel.draft.created`, `fuel.entry.added`, `fuel.entry.updated`, `fuel.entry.removed`,
`fuel.draft.validated`, `fuel.draft.saved`, `fuel.draft.submitted.simulated`,
`fuel.snapshot.created`, `fuel.snapshot.restored`, `fuel.draft.reset`

## Capabilities

| Capability | Valor |
|---|---|
| read | true |
| localWrite | true |
| localPersistenceValidation | true |
| eventAppend | true |
| devPreview | true |
| betaModuleShell | true |

## Blocked capabilities (fail-safe)

| Capability | Valor |
|---|---|
| backendWrite | false |
| connector | false |
| workflow | false |
| marketplacePublish | false |

## Safety

`moduleRegistered:false` · `routeRegistered:false` · `menuRegistered:false` ·
`backendRegistered:false` · `localOnly:true` · `sent:false` · `persistenceReal:false`.
`dangerousCapabilities` = todos `false`.
