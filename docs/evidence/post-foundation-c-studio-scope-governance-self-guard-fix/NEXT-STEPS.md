# Next Steps

## Impacto na PR #462

Após mergear esta PR na main:
- A PR #462 (Preview Sandbox) deve ser **rebaseada** novamente sobre a main.
- Espera-se que `gate:g423-studio-scope-governance-maintenance` **deixe de falhar** na
  branch #462 (o self-guard passa a tolerar os known-later artifacts do Preview Sandbox).
- Nenhum outro bloqueio conhecido permanece para a #462; ela pode então receber PASS final.

## Governança futura

Slices headless futuros continuam registrando seus 4 paths em
`KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS`. O self-guard e os scope checks da cadeia enterprise
já toleram known-later e bloqueiam forbidden/unknown por padrão.
