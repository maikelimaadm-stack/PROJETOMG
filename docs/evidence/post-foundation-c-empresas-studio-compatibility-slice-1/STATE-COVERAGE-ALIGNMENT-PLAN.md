# STATE COVERAGE ALIGNMENT PLAN

`createEmpresasStateCoverageAlignmentPlan()` — 9 estados esperados pelo Studio.

| state | currentCoverage | fail-closed |
| --- | --- | --- |
| emptyState | referenceOnly | — |
| loadingState | referenceOnly | — |
| errorState | referenceOnly | — |
| unauthorizedState | gap | sim |
| tenantMismatchState | referenceOnly | sim |
| permissionDeniedState | referenceOnly | sim |
| validationErrorState | referenceOnly | — |
| fallbackState | aligned | sim |
| diagnosticsState | aligned | — |

Regra: não altera UI; estados de segurança são fail-closed; estado ausente vira gap
(unauthorizedState → SLICE 2).
