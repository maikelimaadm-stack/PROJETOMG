# CANONICAL ERROR CATALOG

`createStudioCanonicalErrorCatalog()` consolida os códigos base + hardening +
certification em um catálogo canônico (46 códigos).

- base (20): STUDIO_INVALID_CONTRACT … STUDIO_MANIFEST_INVALID
- hardening (20): STUDIO_HARDENING_INVALID_BLUEPRINT … STUDIO_HARDENING_MUTATION_BLOCKED
- certification (6): STUDIO_CERTIFICATION_INVALID · STUDIO_CERTIFICATION_DIGEST_MISMATCH ·
  STUDIO_CERTIFICATION_UNSAFE · STUDIO_CERTIFICATION_COMPATIBILITY_BLOCKED ·
  STUDIO_CERTIFICATION_HARDENING_BASELINE_REGRESSED · STUDIO_CERTIFICATION_MANIFEST_INVALID

Cada descritor: code único · type · message sanitizada · safe true · sideEffects false ·
uiCreated/routeCreated/menuCreated/moduleRegistered false · productionAccessed/
backendAccessed/prismaAccessed/migrationExecuted/mutationExecuted/fetchUsed false.
Nenhum descritor expõe secret.
