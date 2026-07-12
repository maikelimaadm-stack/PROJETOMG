# Parity Certification Baseline

`createEmpresasCanonicalParityBaseline({ fixtures })` — paridade repository × API adapter × runtime
projection sobre a fixture certification-small.

## Por cenário

`scenarioId, repositoryDigest, apiDigest, runtimeDigest, equal, score, differences`.

## Global

`contractVersion, scenarioCount, essentialScenarioCount, passed, failed, exactParity, parityScore,
blockers, warnings, certificationDigest`.

## Critério (obrigatório)

`exactParity: true`, `parityScore: 1.0`, `blockers: 0`, nenhum cenário essencial falho. O
`certificationDigest` é determinístico; qualquer divergência silenciosa invalida o baseline.
