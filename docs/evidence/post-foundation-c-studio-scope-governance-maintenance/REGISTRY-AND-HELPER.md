# Registry & Helper

## Registry — `scripts/gates/lib/studioScopeGovernanceRegistry.mjs`

- `FORBIDDEN_SCOPE_PATTERNS` — src/modules, ModeloBase1/2, pages, components, App.jsx,
  apis, framework, bos, backend, backend/prisma, schema.prisma, prisma, migrations,
  migration, runtimeBridge, makBootstrap, PAGEMP, ModeloBase1CadastroPage, .css, runtime
  produtivo (não-teste), productionUiGuard.
- `KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS` — lista EXPLÍCITA e específica: module-preview-sandbox
  (subtree/test/gate/evidence), module-reference-planner (idem), e os próprios artifacts
  desta manutenção de governança. **Sem wildcard amplo** (`^src/studio/`, `^src/`,
  `^backend/`, `^src/modules/`, `.*` são proibidos e testados).
- `SCOPE_SHAPE_PATTERNS` — formas estruturais (test/gate/evidence/package) para relatório.
- `FORBIDDEN_BROAD_ALLOW_SOURCES` — fontes de wildcard que o teste proíbe na allow-list.

## Helper — `scripts/gates/lib/studioScopeGovernanceGuard.mjs`

Puro, determinístico, importa SOMENTE o registry. Sem fetch/Prisma/Railway/child_process/
mutation. Exporta as funções de classificação, filtros, assert e relatório.

Invariantes:
- forbidden sempre vence; known-later nunca libera forbidden.
- known-later nunca vira own_slice_allowed.
- unknown falha por padrão.
- relatório serializável e determinístico (ordena os paths).
