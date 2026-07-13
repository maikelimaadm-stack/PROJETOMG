# HARDENING BASELINE CERTIFICATION

`createStudioCanonicalHardeningBaseline()` roda a camada de hardening e certifica que
todos os mínimos se mantêm; se qualquer baseline cair, a certificação falha.

## Mínimos exigidos

invalid >= 22 · dangerous >= 27 · field >= 35 · screen >= 22 · validation >= 26 ·
permission >= 26 · route/menu >= 19 · persistence >= 17 · runtime binding >= 14 ·
compatibility >= 22 · digest >= 16 · verifier >= 19 · safety invariants = 20 ·
performance >= 165.

## Resultado

`valid: true` · `hardeningReadiness: blueprint_contract_hardened` ·
`hardeningBlockers: []` · `hardeningWarnings: []` · `regressions: []`.
