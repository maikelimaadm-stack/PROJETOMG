# Fuel Dev Preview Fixtures

`createModeloBase2FuelDevPreviewFixtures({ mode })` — deterministic, fictional, no external source.

## Dados fictícios (sem dados reais/sensíveis)

- **Máquinas:** Trator 7230, Pulverizador Jacto, Colheitadeira 1550
- **Operadores:** João da Silva, Maria Oliveira
- **Abastecimentos:** 2 lançamentos fictícios (data fixa, litros, horímetro, serviço, local)

`fictional: true`, `hasSensitiveData: false`.

## Modos

| modo | conteúdo | seedActions |
|---|---|---|
| `empty` | sem entries | — |
| `basic` | draft + 2 entries | newDraft, addFuelEntry×2 |
| `withDraft` | idem basic | newDraft, addFuelEntry×2 |
| `withEvents` | basic + validate + save | newDraft, addFuelEntry×2, validate, saveLocal |

## Determinismo

`createModeloBase2FuelDevPreviewFixtures({ mode:'basic' })` retorna sempre as mesmas entries
(datas/valores fixos). Provado por teste (`deepEqual` entre duas chamadas). Clock injetável.
