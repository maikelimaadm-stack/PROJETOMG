# Capability Matrix

`createGenericModelCapabilityMatrix()` — 12 capacidades × modelType. Todas as **dangerous**
capabilities são `false` neste slice (`dangerousAllFalse === true`).

## Capacidades (keys)

`read`, `localWrite`, `localPersistenceValidation`, `eventAppend`, `transaction`, `reporting`,
`dashboarding`, `workflowState`, `backendWrite`, `connector`, `marketplacePublish`, `studioEditable`.

## Dangerous capabilities (default false, exigem explicitAllowDangerous no futuro)

`backendWrite`, `connector`, `marketplacePublish`, `workflowState`, `transaction`.

## Defaults por tipo

| tipo | read | localWrite | localPersistVal | eventAppend | transaction | reporting | dashboarding | workflowState | backendWrite | connector | marketplace |
|---|---|---|---|---|---|---|---|---|---|---|---|
| cadastro | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | — |
| operacional | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| movimentacao | ✓ | ✓ | ✓ | ✓ | — (futuro) | — | — | — | — | — | — |
| financeiro | ✓ | ✓ | ✓ | — | — (futuro) | — | — | — | — | — | — |
| relatorio | ✓ | — | — | — | — | ✓ | — | — | — | — | — |
| dashboard | ✓ | — | — | — | — | — | ✓ | — | — | — | — |
| workflow | ✓ | — | — | — | — | — | — | — (futuro) | — | — | — |
| custom | ✓ | — | — | — | — | — | — | — | — | — | — |

## Bloqueios (`validateGenericModelCapabilities`, fail-closed)

- `backendWrite: true` sem `explicitAllowDangerous` → **blocked**
- `connector: true` sem `explicitAllowDangerous` → **blocked**
- `marketplacePublish: true` sem `explicitAllowDangerous` → **blocked**
- `workflowState: true` / `transaction: true` sem `explicitAllowDangerous` → **blocked**
- `persistenceReal: true` (em qualquer estágio deste slice) → **blocked** (nunca liberado)
- chave-target estrangeira (fetch/prisma/runtimeBridge/… com nome fora do vocabulário de
  capacidade) → **blocked**

## Futuro com explicitAllowDangerous

Um slice futuro **auditado** poderá habilitar `transaction`/`workflowState`/`backendWrite` para
tipos específicos passando `explicitAllowDangerous: true` — mas **nunca** `persistenceReal` neste
estágio. O default permanece fail-closed.
