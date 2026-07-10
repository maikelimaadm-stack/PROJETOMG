# DIFFERENCE MODEL REPORT — EMPRESAS DUAL READ SHADOW COMPARE

Espelho legível de `empresasDualReadDifferenceModel.js` + `compareEmpresasReadSnapshots.js`.

---

## Categorias

`structure`, `table`, `form`, `field`, `validation`, `permission`, `action`, `data-shape`, `metadata`, `diagnostics`, `safety`.

## Severidades (ascendente)

`info` < `low` < `medium` < `high` < `critical`.

## Estrutura de uma difference

| Campo | Descrição |
|---|---|
| `id` | identificador estável |
| `path` | caminho estrutural (ex.: `form.fields[cpf_cnpj].type`) |
| `category` | uma das categorias acima |
| `severity` | uma das severidades acima |
| `legacyValue` | valor no snapshot legado (mascarado) |
| `runtimeV2Value` | valor no snapshot runtime v2 (mascarado) |
| `message` | descrição legível |
| `recommendedAction` | ação recomendada |
| `blocking` | default `severity === 'critical'`; pode ser sobreposto |
| `gate` | gate relacionado |

## Exemplos de differences

| Cenário | category | severity | blocking |
|---|---|---|---|
| table/form ausente em um snapshot | structure | critical | sim |
| coluna presente só em um lado | table | medium | não |
| campo presente só em um lado | field | high | não |
| drift de tipo conhecido (`tel`→`phone`) | field | low | não |
| drift de tipo inesperado | field | high | sim |
| regras de validação diferentes | validation | medium | não |
| metadata de permissão diferente | permission | high | não |
| action metadata só em um lado | action | medium | não |
| row cell shape diferente | data-shape | low | não |
| runtime v2 sem blocked operations | safety | critical | sim |

## Blocking rules

- `parityStatus`:
  - `parity` — 0 diferenças
  - `acceptable_drift` — nenhuma diferença critical **e** nenhuma blocking
  - `blocked` — há critical **ou** blocking
- `blocked` força `nextAllowedStep = Empresas Dual Read Drift Resolution`.
- `parity`/`acceptable_drift` permitem `nextAllowedStep = Empresas Guarded Read UI Slice`.

## Recommended actions

Cada difference carrega uma `recommendedAction` (ex.: "known canonicalization drift — document in mapping", "reconcile permission metadata before UI exposure", "restore write guard before advancing").

## Ordem determinística

Diferenças ordenadas por (severity desc, category, path, id) — estável entre execuções.

## Gates relacionados

- `gate:g423-empresas-dual-read` (este slice)
- `gate:g423-empresas-readonly`, `gate:g423-shadow-empresas-table-form`, `gate:g423-shadow-empresas` (fontes dos snapshots)
- `gate:g423` (master).
