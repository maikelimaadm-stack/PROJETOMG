# Security Non-Regression

A correção NÃO libera nada. `isKnownLaterStudioHeadlessArtifact` retorna `false` para
qualquer path forbidden (forbidden vence em `classify`), então filtrar `outsideOwn` por
known-later nunca remove um forbidden.

Provas (SG3-SG13 + checks do gate):
- src/modules/studio, src/modules/empresas → self-guard falha
- backend, backend/prisma/schema.prisma → falha
- migrations → falha
- src/App.jsx, src/pages, src/components → falha
- scripts/gates/lib/productionUiGuard.mjs → falha
- unknown path → falha (fica em outsideOwn)
- forbidden não vira warning; unknown não vira warning
- known-later nunca vira own_slice_allowed
- registry sem wildcard amplo (mantido dos testes existentes)

Nenhum código produtivo, dependência, ou productionUiGuard foi alterado.
